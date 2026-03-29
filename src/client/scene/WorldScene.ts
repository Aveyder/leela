import { Keys } from "../resource/Keys";
import InitManager from "../manager/InitManager";
import Join from "../../entity/Join";
import { Opcode } from "../../protocol/Opcode";
import { MODELS } from "../../resource/Model";
import Physics from "../../shared/physics/World";
import GameContext from "../GameContext";
import PhaserLayer = Phaser.GameObjects.Layer;
import UIScene from "./UIScene";
import JoinScene from "./JoinScene";

export default class WorldScene extends Phaser.Scene {

  public static readonly KEY = "WorldScene";

  private context: GameContext;

  private ui: UIScene;

  public phys: Physics;

  private _keys: Keys;

  public charLayer: PhaserLayer;

  constructor() {
    super(WorldScene.KEY);
  }

  public create(): void {
    this.context = GameContext.get(this);

    this.context.world = this;

    this.scene.launch(UIScene.KEY);
    this.scene.bringToTop(UIScene.KEY);

    const session = this.context.session;

    if (this.context.config.debugMode) {
      session.sendObject<Join>(Opcode.MSG_JOIN, {
        model: MODELS[0],
        name: 'TEST'
      });
    } else {
      this.scene.launch(JoinScene.KEY);
      this.scene.bringToTop(JoinScene.KEY);
    }

    this.ui = this.scene.get(UIScene.KEY) as UIScene;
    this.phys = new Physics();

    const init = new InitManager(this);

    this._keys = init.keys;

    session.accept = true;

    this._keys.I.on('down', () => {
      this.ui.inventory.toggle();
    });
  }

  public update(time: number, delta: number): void {
    this.charLayer.sort('y');
  }

  public get keys(): Keys {
    return this._keys;
  }
}
