import { Scene } from "phaser";
import GameObjectComponent from "./GameObjectComponent";
import { Image } from "../../../resource/Image";
import Sprite = Phaser.GameObjects.Sprite;

export default class SpriteComponent<S extends Scene> extends GameObjectComponent<Sprite, S> {

  constructor() {
    super();
  }

  init() {
    this._phaserGameObject = this.scene.make.sprite({key: Image.PLACEHOLDER});
  }

  public get sprite(): Sprite {
    return this._phaserGameObject;
  }
}
