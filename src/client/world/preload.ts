import { Scene } from "phaser";
import caltheraJson from "../../assets/map/calthera.json";
import basePng from "../../assets/map/tilesets/base.png";
import grassPng from "../../assets/map/tilesets/grass.png";
import { Tileset } from "../../map/Tileset";
import { Tilemap } from "../../map/Tilemap";

export default function preload(scene: Scene) {
  const load = scene.load;

  load.spritesheet(Tileset.BASE.imageKey, basePng, {frameWidth: 32, frameHeight: 32});
  load.image(Tileset.GRASS.imageKey, grassPng);
  load.tilemapTiledJSON(Tilemap.CALTHERA.tilemapKey, caltheraJson);
}
