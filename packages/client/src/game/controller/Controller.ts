import NetworkSystem from "../../network/NetworkSystem";
import WorldScene from "../world/WorldScene";
import {Game} from "phaser";
import {EntityId} from "@leela/common";
import Char from "../world/view/Char";
import MovementSystem from "./MovementSystem";
import PlayerControlSystem from "./PlayerControlSystem";
import SpawnSystem from "./SpawnSystem";
import JoinSystem from "./JoinSystem";
import SnapshotSystem from "./SnapshotSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;
import SmoothSystem from "./SmoothSystem";


export default class Controller {

    public readonly chars: Record<EntityId, Char>;

    public playerId: EntityId;

    public readonly worldScene: WorldScene;

    public readonly move: MovementSystem;
    public readonly smooth: SmoothSystem;
    public readonly control: PlayerControlSystem;
    public readonly spawn: SpawnSystem;
    public readonly join: JoinSystem;
    public readonly snapshots: SnapshotSystem;

    constructor(
        public readonly network: NetworkSystem,
        public readonly game: Game
    ) {
        this.chars = {};

        this.worldScene = game.scene.getScene("world") as WorldScene;

        this.smooth = new SmoothSystem(this);
        this.move = new MovementSystem(this);
        this.control = new PlayerControlSystem(this);
        this.spawn = new SpawnSystem(this);
        this.join = new JoinSystem(this);
        this.snapshots = new SnapshotSystem(this);

        this.drawPing();
    }

    private drawPing() {
        const pingText = this.worldScene.add.text(0, 0, "");

        this.worldScene.events.on(UPDATE, () => {
            const latency = this.network.sync.latency;
            pingText.text = `ping: ${latency} ms`;
        });
    }
}
