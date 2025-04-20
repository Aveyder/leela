import { Keys } from "../resource/Keys";
import InitService from "../service/InitService";
import Join from "../../entity/Join";
import { Opcode } from "../../protocol/Opcode";
import { MODELS } from "../../resource/Model";
import Physics from "../../shared/physics/World";
import GameContext from "../GameContext";
import PhaserLayer = Phaser.GameObjects.Layer;
import Graphics = Phaser.GameObjects.Graphics;

export default class WorldScene extends Phaser.Scene {

  public static readonly KEY = "WorldScene";

  private context!: GameContext;

  public phys!: Physics;

  private _keys!: Keys;

  public charLayer!: PhaserLayer;

  private graphics!: Graphics;

  constructor() {
    super(WorldScene.KEY);
  }

  init(data: { context: GameContext }) {
    this.context = data.context;
    this.context.scene = this;
  }

  public create(): void {
    const session = this.context.session!;

    if (this.context.config.debugMode) {
      session.sendObject<Join>(Opcode.MSG_JOIN, {
        model: MODELS[0],
        name: 'TEST'
      });
    } else {
      this.scene.launch("JoinScene", {session: session});
    }

    this.phys = new Physics();

    const init = new InitService(this);

    this._keys = init.keys;

    session.accept = true;
  }

  public update(time: number, delta: number): void {
    this.charLayer.sort('y');
  }

  public get keys(): Keys {
    return this._keys;
  }
}
