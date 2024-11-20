import PreloadService from "./PreloadService";
import WorldClientConfig from "../WorldClientConfig";
import WorldClient from "../WorldClient";
import WorldSession from "../WorldSession";
import { Keys } from "./Keys";
import InitService from "./InitService";
import GameObject from "../../core/GameObject";
import SpriteComponent from "../component/SpriteComponent";
import { MODELS } from "../../resource/Model";
import ModelComponent from "../component/ModelComponent";
import WorldSceneGameObject from "../component/WorldSceneGameObject";
import ControlComponent from "../component/ControlComponent";

export default class WorldScene extends Phaser.Scene {

  private _config!: WorldClientConfig;
  private _client!: WorldClient;
  private _keys!: Keys;

  private _session: null | WorldSession;

  private _control?: ControlComponent;

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

    const player = new WorldSceneGameObject(this, -1);
    const spriteComponent = new SpriteComponent();
    const modelComponent = new ModelComponent();
    this._control = new ControlComponent();
    player.addComponent(spriteComponent);
    player.addComponent(modelComponent);
    player.addComponent(this._control);
    const sprite = spriteComponent.sprite;
    sprite.setPosition(100, 100);
  }

  public update(time: number, delta: number): void {
    this._control?.control();
  }

  public addSession(session: WorldSession) {
    this._session = session;
  }

  public simulate(delta: number): void {
    // this._control?.control();
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
