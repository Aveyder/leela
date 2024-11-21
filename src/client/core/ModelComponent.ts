import Component from "../../core/Component";
import { Model, MODELS } from "../../resource/Model";
import SpriteComponent from "./SpriteComponent";
import Sprite = Phaser.GameObjects.Sprite;

export default class ModelComponent extends Component {

  private sprite!: Sprite | null;
  private _model: Model = MODELS[0];

  constructor() {
    super();

    this.sprite = null;
    this._model = MODELS[0];
  }

  public get model(): Model {
    return this._model;
  }

  public start() {
    this.sprite = this.gameObject.getComponent(SpriteComponent).sprite;
    this.setModel(this._model);
  }

  public destroy() {
    this.sprite = null;
  }

  public setModel(model: Model): void {
    this._model = model;

    if (!this.sprite) return;

    this.sprite.setTexture(model.imageKey);
    this.sprite.setFrame(1);
    this.sprite.play(model.anim.down);
  }

  public stay(): void {
    this.sprite!.anims.pause();
    this.sprite!.setFrame(1);
  }

  public walk(dx: number, dy: number): void {
    const walkAnim = this.getWalkAnim(dx, dy);

    const sprite = this.sprite!;
    const anims = sprite.anims;
    if (anims.currentAnim?.key === walkAnim) {
      anims.resume(anims.currentFrame!);
    } else {
      sprite.play(walkAnim);
    }
  }

  private getWalkAnim(dx: number, dy: number): string {
    if (Math.abs(dy)/Math.abs(dx) >= 1) {
      if (dy > 0) return this._model.anim.down;
      if (dy < 0) return this._model.anim.up;
    } else {
      if (dx > 0) return this._model.anim.right;
      if (dx < 0) return this._model.anim.left;
    }
    return '';
  }
}
