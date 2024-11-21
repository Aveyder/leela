import PreloadService from "./PreloadService";
import WorldClientConfig from "../WorldClientConfig";
import WorldClient from "../WorldClient";
import WorldSession from "../WorldSession";
import { Keys } from "./Keys";
import InitService from "./InitService";
import SpriteComponent from "../core/SpriteComponent";
import { Model, MODELS } from "../../resource/Model";
import ModelComponent from "../core/ModelComponent";
import WorldSceneGameObject from "../core/WorldSceneGameObject";
import ControlComponent from "../core/ControlComponent";
import MovementComponent from "../core/MovementComponent";
import GameObjectManager from "../../core/GameObjectManager";

export default class WorldScene extends Phaser.Scene {

  private guid: number = 0;

  private _config!: WorldClientConfig;
  private _client!: WorldClient;
  private _keys!: Keys;
  private _objects!: GameObjectManager;

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
    this._objects = new GameObjectManager();

    this._control = new ControlComponent();
    const char1 = this.createChar(100, 100, MODELS[0]);
    const char2 = this.createChar(100, 200, MODELS[5]);

    char2.addComponent(this._control);
  }

  public update(time: number, delta: number): void {
    this._objects.update(delta);
  }

  public addSession(session: WorldSession) {
    this._session = session;
  }

  public simulate(delta: number): void {
    this._control?.applyControl();
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

  private createChar(x: number, y: number, model: Model) {
    const char = new WorldSceneGameObject(this, this.guid++);

    const spriteComponent = new SpriteComponent();
    const modelComponent = new ModelComponent();

    char.addComponent(spriteComponent);
    char.addComponent(modelComponent);
    char.addComponent(new MovementComponent());

    modelComponent.setModel(model);

    const sprite = spriteComponent.sprite;
    sprite.setPosition(x, y);

    return char;
  }
}
