import caltheraJson from "../../assets/map/calthera.json";
import basePng from "../../assets/map/tilesets/base.png";
import grassPng from "../../assets/map/tilesets/grass.png";
import { Tileset } from "../../map/Tileset";
import { Tilemap } from "../../map/Tilemap";
import WorldScene from "./WorldScene";
import LoaderPlugin = Phaser.Loader.LoaderPlugin;

export default class PreloadService {

  public readonly scene: WorldScene;
  public readonly load: LoaderPlugin;

  constructor(scene: WorldScene) {
    this.scene = scene;
    this.load = scene.load;

    this.preload();
  }

  private preload(): void {
    this.load.spritesheet(Tileset.BASE.imageKey, basePng, {frameWidth: 32, frameHeight: 32});
    this.load.image(Tileset.GRASS.imageKey, grassPng);
    this.load.tilemapTiledJSON(Tilemap.CALTHERA.tilemapKey, caltheraJson);
  }
}
