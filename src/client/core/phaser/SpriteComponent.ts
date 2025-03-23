import { Scene } from "phaser";
import GameObjectComponent from "./GameObjectComponent";
import { Image } from "../../../resource/Image";
import Sprite = Phaser.GameObjects.Sprite;
import { Layer } from "../../../resource/map/Layer";

export default class SpriteComponent<S extends Scene> extends GameObjectComponent<Sprite, S> {

  constructor() {
    super();
  }

  init() {
    this._phaserGameObject = this.scene.make.sprite({key: Image.PLACEHOLDER});
    this._phaserGameObject.depth = Layer.BUILDING_EXTERIOR.zIndex;
  }

  public get sprite(): Sprite {
    return this.phaserGameObject;
  }
}
