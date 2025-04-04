import { Keys } from "../resource/Keys";
import InitService from "../service/InitService";
import GameObjectManager from "../../core/GameObjectManager";
import PhaserLayer = Phaser.GameObjects.Layer;
import WorldSession from "../WorldSession";
import Join from "../../entity/Join";
import { Opcode } from "../../protocol/Opcode";
import { MODELS } from "../../resource/Model";

export default class WorldScene extends Phaser.Scene {

  private session!: WorldSession;

  private _keys!: Keys;
  private _objects!: GameObjectManager;

  public charLayer!: PhaserLayer;

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

    const init = new InitService(this);

    this._keys = init.keys;
    this._objects = new GameObjectManager();

    this.session.init(this);
  }

  public update(time: number, delta: number): void {
    this._objects.update(delta / 1000);

    this.charLayer.sort('y');
  }

  public get keys(): Keys {
    return this._keys;
  }

  public get objects(): GameObjectManager {
    return this._objects;
  }
}
