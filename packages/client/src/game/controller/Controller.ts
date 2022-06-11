import NetworkSystem from "../../network/NetworkSystem";
import WorldScene from "../world/WorldScene";
import {Game} from "phaser";
import {EntityId, map, PhysicsWorld} from "@leela/common";
import Char from "../world/view/Char";
import EntityPositionSystem from "./EntityPositionSystem";
import SampleInputSystem from "./SampleInputSystem";
import SpawnSystem from "./SpawnSystem";
import JoinSystem from "./JoinSystem";
import SnapshotSystem from "./SnapshotSystem";
import DebugSystem from "./debugmode/DebugSystem";
import {DEBUG_MODE} from "../../constants/config";
import MovementSystem from "./MovementSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;


export default class Controller {

    public readonly chars: Record<EntityId, Char>;

    public playerCharId: EntityId;
    public playerChar: Char;

    public readonly worldScene: WorldScene;

    public readonly move: MovementSystem;
    public readonly physics: PhysicsWorld;
    public readonly position: EntityPositionSystem;
    public readonly input: SampleInputSystem;
    public readonly spawn: SpawnSystem;
    public readonly join: JoinSystem;
    public readonly snapshots: SnapshotSystem;
    public readonly debug: DebugSystem;

    constructor(
        public readonly network: NetworkSystem,
        public readonly game: Game
    ) {
        this.chars = {};

        this.worldScene = game.scene.getScene("world") as WorldScene;

        this.move = new MovementSystem(this);
        this.physics = new PhysicsWorld(map);
        this.position = new EntityPositionSystem(this);
        this.input = new SampleInputSystem(this);
        this.spawn = new SpawnSystem(this);
        this.join = new JoinSystem(this);
        this.snapshots = new SnapshotSystem(this);
        if (DEBUG_MODE) {
            this.debug = new DebugSystem(this);
        }

        this.worldScene.drawMap(this.physics);
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
