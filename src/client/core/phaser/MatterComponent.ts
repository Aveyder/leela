import MatterTransform = Phaser.Physics.Matter.Components.Transform;
import SpriteComponent from "./SpriteComponent";
import WorldScene from "../../world/WorldScene";
import SceneComponent from "./SceneComponent";
import GameObject = Phaser.GameObjects.GameObject;
import Sprite = Phaser.Physics.Matter.Sprite;
import Image = Phaser.Physics.Matter.Image;
import Collision = Phaser.Physics.Matter.Components.Collision;
import { CollisionCategory } from "../../../shared/CollisionCategory";

export default class MatterComponent extends SceneComponent<WorldScene> {

  protected _matterGameObject!: GameObject | Sprite | Image;

  constructor() {
    super();
  }

  public start(): void {
    const sprite = this.gameObject.getComponent(SpriteComponent);

    this._matterGameObject = this.scene.matter.add.gameObject(sprite.phaserGameObject, {
      shape: {
        width: 16,
        height: 32
      }
    });

    (this._matterGameObject as Collision).setCollisionCategory(CollisionCategory.PLAYER);
    (this._matterGameObject as Collision).setCollidesWith(CollisionCategory.WALL);

    (this._matterGameObject as MatterTransform).setFixedRotation()
  }
}
