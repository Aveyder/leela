import GameObjectComponent from "./GameObjectComponent";
import { Image } from "../../../resource/Image";
import { Layer } from "../../../resource/map/Layer";
import Sprite = Phaser.GameObjects.Sprite;

export default class SpriteComponent extends GameObjectComponent<Sprite> {

  constructor(sceneKey: string) {
    super(sceneKey);
  }

  init() {
    this._phaserGameObject = this.getScene().make.sprite({key: Image.PLACEHOLDER});
    this._phaserGameObject.depth = Layer.BUILDING_EXTERIOR.zIndex;
  }

  public get sprite(): Sprite {
    return this.phaserGameObject;
  }
}
