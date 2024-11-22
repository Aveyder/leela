import PreloadService from "./PreloadService";
import WorldClientConfig from "../WorldClientConfig";
import WorldClient from "../WorldClient";
import WorldSession from "../WorldSession";
import { Keys } from "./Keys";
import InitService from "./InitService";
import { Model } from "../../resource/ModelDescriptor";
import ControlComponent from "../core/ControlComponent";
import GameObjectManager from "../../core/GameObjectManager";
import { Opcode } from "../../protocol/Opcode";
import Join from "../../entity/Join";

export default class WorldScene extends Phaser.Scene {

  private guid: number = 0;

  private _config!: WorldClientConfig;
  private _client!: WorldClient;
  private _keys!: Keys;
  private _objects!: GameObjectManager;

  private _session: null | WorldSession;

  constructor() {
    super("world");

    this._session = null;
  }

  public preload(): void {
    new PreloadService(this);
  }

  public create(): void {
    this._config = WorldClientConfig.fromEnv();
    this._client = new WorldClient(this);

    this._client.connect();

    const init = new InitService(this);

    this._keys = init.keys;
    this._objects = new GameObjectManager();
  }

  public update(time: number, delta: number): void {
    this._objects.update(delta);
  }

  public addSession(session: WorldSession) {
    this._session = session;

    this._session.sendObject<Join>(Opcode.MSG_JOIN, {
      modelId: Model.UNIT_3.id,
      name: "Kinsinar"
    });
  }

  public simulate(delta: number): void {
        this.session?.state.player?.getComponent(ControlComponent).applyControl();
  }

  public removeSession() {
    this._session = null;
  }

  public get config(): WorldClientConfig {
    return this._config;
  }

  public get client(): WorldClient {
    return this._client;
  }

  public get keys(): Keys {
    return this._keys;
  }

  public get objects(): GameObjectManager {
    return this._objects;
  }

  public get session(): null | WorldSession {
    return this._session;
  }
}
