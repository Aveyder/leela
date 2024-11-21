import PreloadService from "./PreloadService";
import WorldClientConfig from "../WorldClientConfig";
import WorldClient from "../WorldClient";
import WorldSession from "../WorldSession";
import { Keys } from "./Keys";
import InitService from "./InitService";
import GameObject from "../../core/GameObject";
import SpriteComponent from "../component/SpriteComponent";
import { Model, MODELS } from "../../resource/Model";
import ModelComponent from "../component/ModelComponent";
import WorldSceneGameObject from "../component/WorldSceneGameObject";
import ControlComponent from "../component/ControlComponent";
import MovementComponent from "../component/MovementComponent";

export default class WorldScene extends Phaser.Scene {

  private guid: number = 0;

  private _config!: WorldClientConfig;
  private _client!: WorldClient;
  private _keys!: Keys;
  private _gameObjects!: Map<number, GameObject>;

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
    this._gameObjects = new Map();

    this._control = new ControlComponent();
    const char1 = this.createChar(100, 100, MODELS[0]);
    const char2 = this.createChar(100, 200, MODELS[5]);

    char2.addComponent(this._control);
  }

  public update(time: number, delta: number): void {
    for(const gameObject of this._gameObjects.values()) {
      gameObject.update(delta);
    }
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

  public get gameObjects(): Map<number, GameObject> {
    return this._gameObjects;
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
