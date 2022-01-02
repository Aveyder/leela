import NetworkSystem from "../../network/NetworkSystem";
import GameScene from "../scene/GameScene";
import {Game} from "phaser";
import {EntityId} from "@leela/common";
import Char from "../scene/view/Char";
import MovementController from "./MovementController";
import PlayerController from "./PlayerController";
import SpawnController from "./SpawnController";
import JoinController from "./JoinController";
import SnapshotController from "./SnapshotController";


export default class Controller {

    public readonly chars: Record<EntityId, Char>;

    public playerId: EntityId;

    public readonly gameScene: GameScene;

    public readonly move: MovementController;
    public readonly control: PlayerController;
    public readonly spawn: SpawnController;
    public readonly join: JoinController;
    public readonly snapshots: SnapshotController;

    constructor(
        public readonly network: NetworkSystem,
        public readonly game: Game
    ) {
        this.chars = {};

        this.gameScene = game.scene.getScene("game") as GameScene;

        this.move = new MovementController(this);
        this.control = new PlayerController(this);
        this.spawn = new SpawnController(this);
        this.join = new JoinController(this);
        this.snapshots = new SnapshotController(this);
    }
}
