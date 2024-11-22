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

  update(delta: number) {
    this._sprite.x = this.gameObject.x;
    this._sprite.y = this.gameObject.y;
  }

  public destroy(): void {
    this.sprite.destroy();
  }
}
