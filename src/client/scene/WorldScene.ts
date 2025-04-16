import { Keys } from "../resource/Keys";
import InitService from "../service/InitService";
import GameObjectManager from "../../core/GameObjectManager";
import PhaserLayer = Phaser.GameObjects.Layer;
import WorldSession from "../WorldSession";
import Join from "../../entity/Join";
import { Opcode } from "../../protocol/Opcode";
import { MODELS } from "../../resource/Model";
import Graphics = Phaser.GameObjects.Graphics;
import { CHAR_WIDTH, CHAT_HEIGHT } from "../../shared/Constants";
import ServerComponent from "../core/ServerComponent";
import PhysicsWorld from "../../shared/physics/World";

export default class WorldScene extends Phaser.Scene {

  private session!: WorldSession;

  public physicsWorld!: PhysicsWorld;

  private _keys!: Keys;
  private _objects!: GameObjectManager;

  public charLayer!: PhaserLayer;

  private graphics!: Graphics;

  constructor() {
    super("WorldScene");
  }

  init(data: { session: WorldSession }) {
    this.session = data.session;
  }

  public create(): void {
    if (this.session.config.debugMode) {
      this.session.sendObject<Join>(Opcode.MSG_JOIN, {
        model: MODELS[0],
        name: 'TEST'
      });
    } else {
      this.scene.launch("JoinScene", {session: this.session});
    }

    this.physicsWorld = new PhysicsWorld();

    const init = new InitService(this);

    this._keys = init.keys;
    this._objects = new GameObjectManager();

    this.session.init(this);

    this.graphics = this.add.graphics();
  }

  public update(time: number, delta: number): void {
    this._objects.update(delta / 1000);

    this.charLayer.sort('y');

    this.graphics.clear();
    this._objects.forEach(gameObject => {
      const serverComponent = gameObject.getComponent(ServerComponent);

      if (serverComponent) {
        const state = serverComponent.getLastState().gameObject;
        this.graphics.lineStyle(2, 0xff0000, 1);
        this.graphics.strokeRect(state.x - CHAR_WIDTH / 2, state.y - CHAT_HEIGHT / 2, CHAR_WIDTH, CHAT_HEIGHT);
      }
    });
  }

  public get keys(): Keys {
    return this._keys;
  }

  public get objects(): GameObjectManager {
    return this._objects;
  }
}
