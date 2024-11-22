import Component from "../../core/Component";
import { Model, ModelDescriptor, MODELS } from "../../resource/ModelDescriptor";
import SpriteComponent from "./phaser/SpriteComponent";
import Sprite = Phaser.GameObjects.Sprite;
import MovementComponent from "./MovementComponent";

export default class ModelComponent extends Component {

  private sprite!: Sprite;
  private movement!: MovementComponent;
  private _model: ModelDescriptor;

  constructor() {
    super();

    this._model = Model.UNIT_0;
  }

  public get model(): ModelDescriptor {
    return this._model;
  }

  public start(): void {
    this.sprite = this.gameObject.getComponent(SpriteComponent).sprite;
    this.movement = this.gameObject.getComponent(MovementComponent);

    this.setModel(this._model);
  }

  public lateUpdate(delta: number): void {
    const dx = this.movement.dx;
    const dy = this.movement.dy;
    if (dx === 0 && dy === 0) {
      this.stay();
    } else {
      this.walk(dx, dy);
    }
  }

  public setModel(model: ModelDescriptor): void {
    this._model = model;

    if (!this.sprite) return;

    this.sprite.setTexture(model.imageKey);
    this.sprite.setFrame(1);
    this.sprite.play(model.anim.down);
  }

  private stay(): void {
    this.sprite!.anims.pause();
    this.sprite!.setFrame(1);
  }

  private walk(dx: number, dy: number): void {
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
