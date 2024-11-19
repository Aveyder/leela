import PreloadService from "./PreloadService";
import WorldClientConfig from "../WorldClientConfig";
import WorldClient from "../WorldClient";
import WorldSession from "../WorldSession";
import { Keys } from "./Keys";
import InitService from "./InitService";

export default class WorldScene extends Phaser.Scene {

  private _config!: WorldClientConfig;
  private _client!: WorldClient;
  private _keys!: Keys;

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
  }

  public addSession(session: WorldSession) {
    this._session = session;
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

  public get session(): null | WorldSession {
    return this._session;
  }
}
