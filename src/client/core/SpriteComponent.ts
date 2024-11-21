import { Image } from "../../resource/Image";
import WorldSceneComponent from "./WorldSceneComponent";
import Sprite = Phaser.GameObjects.Sprite;

export default class SpriteComponent extends WorldSceneComponent {
  private _sprite!: Sprite;

  public get sprite(): Sprite {
    return this._sprite;
  }

  public start(): void {
    this._sprite = this.scene.add.sprite(0, 0, Image.PLACEHOLDER);
  }

  public destroy(): void {
    this.sprite.destroy();
  }
}
