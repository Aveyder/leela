import { ModelDescriptor, MODELS } from "../../resource/Model";
import SpriteComponent from "./phaser/SpriteComponent";
import { Image } from "../../resource/Image";
import ContextAwareComponent from "./phaser/ContextAwareComponent";
import Sprite = Phaser.GameObjects.Sprite;

export default class ModelComponent extends ContextAwareComponent {

  private sprite: Sprite;
  private _model: ModelDescriptor;

  constructor() {
    super();

    this._model = MODELS[0];
  }

  public get model(): ModelDescriptor {
    return this._model;
  }

  public start(): void {
    this.sprite = this.gameObject.getComponent(SpriteComponent).sprite;
    this.context.world.charLayer.add(this.sprite);

    this.setModel(this._model);
  }

  public setDirection(dx: number, dy: number) {
    if (dx === 0 && dy === 0) {
      this.stay();
    } else {
      this.walk(dx, dy);
    }
  }

  public setModel(model: ModelDescriptor): void {
    if (this._model === model && this.sprite.texture.key != Image.PLACEHOLDER) return;

    this._model = model;

    if (!this.sprite) return;

    this.sprite.setTexture(model.imageKey);
    this.resetAnim();
  }

  public stay(): void {
    this.resetAnim();
    this.sprite.anims.pause();
  }

  public walk(dx: number, dy: number): void {
    const walkAnim = this.getWalkAnim(dx, dy);

    const sprite = this.sprite;
    const anims = sprite.anims;
    if (anims.currentAnim?.key === walkAnim) {
      anims.resume(anims.currentFrame);
    } else {
      sprite.play(walkAnim);
    }
  }

  private resetAnim(): void {
    this.sprite.play(this._model.anim.down);
    this.sprite.setFrame(this.sprite.anims.currentAnim.getFrameAt(1).frame.name);
  }

  private getWalkAnim(dx: number, dy: number): string {
    if (Math.abs(dy) / Math.abs(dx) >= 1) {
      if (dy > 0) return this._model.anim.down;
      if (dy < 0) return this._model.anim.up;
    } else {
      if (dx > 0) return this._model.anim.right;
      if (dx < 0) return this._model.anim.left;
    }
    return '';
  }
}
