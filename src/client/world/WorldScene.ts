import preload from "./preload";
import { Tileset } from "../../map/Tileset";
import { Layer } from "../../map/Layer";
import { Tilemap } from "../../map/Tilemap";
import WorldClientConfig from "../WorldClientConfig";
import WorldClient from "../WorldClient";
import WorldSession from "../WorldSession";

export default class WorldScene extends Phaser.Scene {

  private _config!: WorldClientConfig;
  private _client!: WorldClient;

  constructor() {
    super("world");
  }

  public preload(): void {
    preload(this);
  }

  public create(): void {
    this._config = WorldClientConfig.fromEnv();
    this._client = new WorldClient(this);

    this._client.connect();

    console.log(this._client);

    initTilemap(this);
  }

  public get config() {
    return this._config;
  }

  public get client() {
    return this._client;
  }

  public addSession(worldSession: WorldSession) {
  }

  public removeSession() {
  }
}

function initTilemap(worldScene: WorldScene) {
  const tilemap = worldScene.add.tilemap(Tilemap.CALTHERA.tilemapKey);

  tilemap.addTilesetImage(Tileset.BASE.name, Tileset.BASE.imageKey);

  const groundLayer = tilemap.createLayer(Layer.GROUND.name, [Tileset.BASE.name])!;
  groundLayer.depth = Layer.GROUND.zIndex;

  const terrainLayer = tilemap.createLayer(Layer.TERRAIN.name, [Tileset.BASE.name])!;
  terrainLayer.depth = Layer.TERRAIN.zIndex;

  const buildingInteriorLayer = tilemap.createLayer(Layer.BUILDING_INTERIOR.name, [Tileset.BASE.name])!;
  buildingInteriorLayer.depth = Layer.BUILDING_INTERIOR.zIndex;

  const foregroundLayer = tilemap.createLayer(Layer.FOREGROUND.name, [Tileset.BASE.name])!;
  foregroundLayer.depth = Layer.FOREGROUND.zIndex;
}
