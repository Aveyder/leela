import Component from "../../core/Component";
import { Scene } from "phaser";
import { Image } from "../../resource/Image";
import Sprite = Phaser.GameObjects.Sprite;
import { Model, MODELS } from "../../resource/Model";
import SpriteComponent from "./SpriteComponent";

export default class ModelComponent extends Component {

  private sprite!: Sprite;
  private _model: Model = MODELS[0];

  constructor() {
    super();
  }

  public get model(): Model {
    return this._model;
  }

  public start() {
    this.sprite = this.gameObject.getComponent(SpriteComponent).sprite;
    this.setModel(this._model);
  }

  public setModel(model: Model): void {
    this._model = model;

    this.sprite.setTexture(model.imageKey);
    this.sprite.setFrame(1);
    this.sprite.play(model.anim.down);
  }

  public walk(): void {

  }

  public stay(): void {

  }
}
