import preload from "./preload";
import { initTilemap } from "./Tilemap";

export default class WorldScene extends Phaser.Scene {

  constructor() {
    super("world");
  }

  public preload(): void {
    preload(this);
  }

  public create(): void {
    initTilemap(this);
  }
}
