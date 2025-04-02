import WorldScene from "../scene/WorldScene";
import { Keys } from "../resource/Keys";
import { Tilemap } from "../../resource/map/Tilemap";
import { Tileset } from "../../resource/map/Tileset";
import { Layer } from "../../resource/map/Layer";
import { Image } from "../../resource/Image";
import { CollisionCategory } from "../../shared/Constants";
import MatterTileBody = Phaser.Physics.Matter.TileBody;
import { Sprite } from "../../resource/Sprite";

export default class InitService {

  public readonly scene: WorldScene;
  private _keys!: Keys;

  constructor(scene: WorldScene) {
    this.scene = scene;

    this.init();
  }

  private init(): void {
    this.initTilemap();
    this.initKeys();
    this.initCharLayer();
    this.initUI();
  }

  private initTilemap(): void {
    const tilemap = this.scene.add.tilemap(Tilemap.CALTHERA.jsonKey);

    tilemap.addTilesetImage(Tileset.BASE, Image.TILESET_BASE);
    tilemap.addTilesetImage(Tileset.GRASS, Image.TILESET_GRASS);

    const groundLayer = tilemap.createLayer(Layer.GROUND.name, [Tileset.BASE, Tileset.GRASS])!;
    groundLayer.depth = Layer.GROUND.zIndex;

    const terrainLayer = tilemap.createLayer(Layer.TERRAIN.name, [Tileset.BASE])!;
    terrainLayer.depth = Layer.TERRAIN.zIndex;

    const buildingInteriorLayer = tilemap.createLayer(Layer.BUILDING_INTERIOR.name, [Tileset.BASE])!;
    buildingInteriorLayer.depth = Layer.BUILDING_INTERIOR.zIndex;

    const foregroundLayer = tilemap.createLayer(Layer.FOREGROUND.name, [Tileset.BASE])!;
    foregroundLayer.depth = Layer.FOREGROUND.zIndex;

    // tilemap physics
    setTimeout(() => {
      this.scene.matter.world.convertTiles(buildingInteriorLayer.cull(this.scene.cameras.main));
      buildingInteriorLayer.cull(this.scene.cameras.main).forEach(tile => {
        const matterBody = (tile.physics as any).matterBody as MatterTileBody;
        if (matterBody) {
          matterBody.setCollisionCategory(CollisionCategory.WALL);
          matterBody.setCollidesWith(CollisionCategory.WALL | CollisionCategory.PLAYER);
        }
      });
    }, 0);
  }

  private initKeys(): void {
    this._keys = this.scene.input.keyboard!.addKeys("W,A,S,D,up,left,down,right,Z", false) as Keys;
  }

  private initCharLayer(): void {
    this.scene.charLayer = this.scene.add.layer();
    this.scene.charLayer.depth = Layer.BUILDING_INTERIOR.zIndex;
  }

  private initUI(): void {
    const bagButton = this.scene.add.image(300, 300, Image.GENERAL, Sprite.BAG_BUTTON);
    bagButton.depth = Layer.UI.zIndex;
  }

  public get keys(): Keys {
    return this._keys;
  }
}
