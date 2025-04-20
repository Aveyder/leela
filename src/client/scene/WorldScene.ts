import { Keys } from "../resource/Keys";
import InitService from "../service/InitService";
import GameObjectManager from "../../core/GameObjectManager";
import WorldSession from "../WorldSession";
import Join from "../../entity/Join";
import { Opcode } from "../../protocol/Opcode";
import { MODELS } from "../../resource/Model";
import Physics from "../../shared/physics/World";
import { CHAR_WIDTH, CHAT_HEIGHT } from "../../shared/Constants";
import ServerComponent from "../core/ServerComponent";
import { Layer } from "../../resource/map/Layer";
import { Game } from "phaser";
import PhaserLayer = Phaser.GameObjects.Layer;
import Graphics = Phaser.GameObjects.Graphics;
import GameUtils from "../utils/GameUtils";

export default class WorldScene extends Phaser.Scene {

  public static readonly KEY = "WorldScene";

  private session!: WorldSession;

  public phys!: Physics;

  private _keys!: Keys;
  private _objects!: GameObjectManager;

  public charLayer!: PhaserLayer;

  private graphics!: Graphics;

  constructor() {
    super(WorldScene.KEY);
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

    this.phys = new Physics();

    const init = new InitService(this);

    this._keys = init.keys;
    this._objects = GameUtils.getObjects(this);

    this.session.accept = true;

    this.graphics = this.add.graphics();
    this.graphics.depth = Layer.UI.zIndex;
  }

  public update(time: number, delta: number): void {
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

  public static get(game: Game): WorldScene {
    return game.scene.getScene(WorldScene.KEY) as WorldScene
  }
}
