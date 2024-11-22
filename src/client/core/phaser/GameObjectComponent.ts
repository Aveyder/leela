import SceneComponent from "./SceneComponent";
import { Scene } from "phaser";
import GameObject = Phaser.GameObjects.GameObject;
import Transform = Phaser.GameObjects.Components.Transform;
import Visible = Phaser.GameObjects.Components.Visible;

export default class GameObjectComponent<G extends GameObject & Transform & Visible, S extends Scene> extends SceneComponent<S> {

  protected _phaserGameObject!: G;

  constructor() {
    super();
  }

  public start(): void {
    this._phaserGameObject = this.scene.add.existing(this._phaserGameObject);
  }

  lateUpdate(delta: number) {
    this._phaserGameObject.x = this.gameObject.x;
    this._phaserGameObject.y = this.gameObject.y;
    this._phaserGameObject.visible = this.gameObject.visible;
  }

  public destroy(): void {
    this._phaserGameObject.destroy();
  }
}
