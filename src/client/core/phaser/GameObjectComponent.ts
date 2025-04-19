import PhaserAwareComponent from "./PhaserAwareComponent";
import { Scene } from "phaser";
import GameObject = Phaser.GameObjects.GameObject;
import Transform = Phaser.GameObjects.Components.Transform;
import Visible = Phaser.GameObjects.Components.Visible;

export default class GameObjectComponent<G extends GameObject & Transform & Visible> extends PhaserAwareComponent {

  private sceneKey!: string;

  protected _phaserGameObject!: G;

  constructor(scene: string) {
    super();

    this.sceneKey = scene;
  }

  public start(): void {
    this._phaserGameObject = this.getScene().add.existing(this._phaserGameObject);
  }

  lateUpdate(delta: number) {
    this._phaserGameObject.x = this.gameObject.x;
    this._phaserGameObject.y = this.gameObject.y;
    this._phaserGameObject.visible = this.gameObject.visible;
  }

  public destroy(): void {
    this._phaserGameObject.destroy();
  }

  public get phaserGameObject(): G {
    return this._phaserGameObject;
  }

  public getScene(): Scene {
    return this.game.scene.getScene(this.sceneKey)!;
  }
}
