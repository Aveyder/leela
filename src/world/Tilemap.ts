import WorldScene from "./WorldScene";
import { Layer, LayerDescriptor } from "./Layer";
import { Tileset } from "./Tileset";
import PhaserTilemap = Phaser.Tilemaps.Tilemap;

export interface TilemapDescriptor {
  name: string;
  tilemapKey: string;
}

export class Tilemap {
  static readonly CALTHERA: TilemapDescriptor = {
    name: "calthera",
    tilemapKey: "calthera"
  };
}

export function initTilemap(worldScene: WorldScene) {
  const tilemap = worldScene.add.tilemap(Tilemap.CALTHERA.tilemapKey);

  tilemap.addTilesetImage(Tileset.BASE.name, Tileset.BASE.imageKey);

  createLayer(tilemap, Layer.GROUND);
  createLayer(tilemap, Layer.TERRAIN);
  createLayer(tilemap, Layer.BUILDING_INTERIOR);
  createLayer(tilemap, Layer.FOREGROUND);
}

function createLayer(tilemap: PhaserTilemap, layer: LayerDescriptor) {
  tilemap.createLayer(layer.name, [Tileset.BASE.name])!.depth = layer.zIndex;
}
