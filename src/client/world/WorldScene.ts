import PreloadService from "./PreloadService";
import WorldClientConfig from "../WorldClientConfig";
import WorldClient from "../WorldClient";
import WorldSession from "../WorldSession";
import { Keys } from "./Keys";
import InitService from "./InitService";
import { ModelDescriptor, MODELS } from "../../resource/Model";
import GameObjectManager from "../../core/GameObjectManager";
import { Opcode } from "../../protocol/Opcode";
import Join from "../../entity/Join";
import GameObject from "../../core/GameObject";
import GameObjectState from "../../entity/GameObjectState";
import { ComponentId } from "../../protocol/ComponentId";
import ModelComponent from "../core/ModelComponent";
import Player from "../core/Player";
import Char from "../core/Char";
import SpawnManager from "./SpawnManager";

export default class WorldScene extends Phaser.Scene {

  private guid: number = 0;

  private _config!: WorldClientConfig;
  private _client!: WorldClient;
  private _keys!: Keys;
  private _objects!: GameObjectManager;
  private _spawn!: SpawnManager;

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
    this._spawn = new SpawnManager(this);
  }

  public update(time: number, delta: number): void {
    this._objects.update(delta / 1000);
  }

  public addSession(session: WorldSession) {
    this._session = session;

    this._session.sendObject<Join>(Opcode.MSG_JOIN, {
      model: MODELS[Math.floor(Math.random() * MODELS.length)],
      name: "Kinsinar"
    });
  }

  public removeSession() {
    this._session = null;
  }

  public createGameObject(state: GameObjectState): void {
    if (state.guid === this._session?.scope.playerGuid) {
      const player = new Player(this, this._session, state.guid);
      this.createChar(player, state);

      this._session.scope.player = player;
    } else {
      const char = new Char(this, state.guid);
      this.createChar(char, state);
    }
  }

  public createChar(char: GameObject, state: GameObjectState): void {
    const model = state.components.get(ComponentId.MODEL) as ModelDescriptor;
    char.getComponent(ModelComponent).setModel(model);

    char.x = state.x;
    char.y = state.y;

    this.objects.add(char);
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

  public get spawn(): SpawnManager {
    return this._spawn;
  }

  public get session(): null | WorldSession {
    return this._session;
  }
}
