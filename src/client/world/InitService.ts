import WorldScene from "./WorldScene";
import { Keys } from "./Keys";
import { Tilemap } from "../../resource/map/Tilemap";
import { Tileset } from "../../resource/map/Tileset";
import { Layer } from "../../resource/map/Layer";
import { Image } from "../../resource/Image";

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
  }

  private initTilemap(): void {
    const tilemap = this.scene.add.tilemap(Tilemap.CALTHERA.jsonKey);

    tilemap.addTilesetImage(Tileset.BASE, Image.TILESET_BASE);

    const groundLayer = tilemap.createLayer(Layer.GROUND.name, [Tileset.BASE])!;
    groundLayer.depth = Layer.GROUND.zIndex;

    const terrainLayer = tilemap.createLayer(Layer.TERRAIN.name, [Tileset.BASE])!;
    terrainLayer.depth = Layer.TERRAIN.zIndex;

    const buildingInteriorLayer = tilemap.createLayer(Layer.BUILDING_INTERIOR.name, [Tileset.BASE])!;
    buildingInteriorLayer.depth = Layer.BUILDING_INTERIOR.zIndex;

    const foregroundLayer = tilemap.createLayer(Layer.FOREGROUND.name, [Tileset.BASE])!;
    foregroundLayer.depth = Layer.FOREGROUND.zIndex;
  }

  private initKeys(): void {
    this._keys = this.scene.input.keyboard!.addKeys("W,A,S,D,up,left,down,right,Z", false) as Keys;
  }

  public get keys(): Keys {
    return this._keys;
  }
}
