import WorldScene from "../scene/WorldScene";
import { Keys } from "../resource/Keys";
import { Tilemap } from "../../resource/map/Tilemap";
import { Tileset } from "../../resource/map/Tileset";
import { Layer } from "../../resource/map/Layer";
import { Image } from "../../resource/Image";
import * as tiledUtils from "../../server/utils/tiled";
import CaltheraMap from "../../assets/map/calthera.json";

export default class InitManager {

  public readonly scene: WorldScene;
  private _keys: Keys;

  constructor(scene: WorldScene) {
    this.scene = scene;

    this.init();
  }

  private init(): void {
    this.initTilemap();
    this.initKeys();
    this.initCharLayer();
    // this.initUI();
  }

  private initTilemap(): void {
    const tilemap = this.scene.add.tilemap(Tilemap.CALTHERA.jsonKey);

    tilemap.addTilesetImage(Tileset.BASE, Image.TILESET_BASE);
    tilemap.addTilesetImage(Tileset.GRASS, Image.TILESET_GRASS);

    const groundLayer = tilemap.createLayer(Layer.GROUND.name, [Tileset.BASE, Tileset.GRASS]);
    groundLayer.depth = Layer.GROUND.zIndex;

    const terrainLayer = tilemap.createLayer(Layer.TERRAIN.name, [Tileset.BASE]);
    terrainLayer.depth = Layer.TERRAIN.zIndex;

    const buildingInteriorLayer = tilemap.createLayer(Layer.BUILDING_INTERIOR.name, [Tileset.BASE]);
    buildingInteriorLayer.depth = Layer.BUILDING_INTERIOR.zIndex;

    const foregroundLayer = tilemap.createLayer(Layer.FOREGROUND.name, [Tileset.BASE]);
    foregroundLayer.depth = Layer.FOREGROUND.zIndex;

    // tilemap physics
    tiledUtils.createBodiesFromObjectGroups(CaltheraMap).forEach(body => this.scene.phys.add(body));
  }

  private initKeys(): void {
    this._keys = this.scene.input.keyboard.addKeys("W,A,S,D,up,left,down,right,Z,I,E", false) as Keys;
  }

  private initCharLayer(): void {
    this.scene.charLayer = this.scene.add.layer();
    this.scene.charLayer.depth = Layer.BUILDING_INTERIOR.zIndex;
  }

  public get keys(): Keys {
    return this._keys;
  }
}
