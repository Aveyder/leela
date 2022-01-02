import World from "../world/World";
import NetworkSystem from "../../network/NetworkSystem";
import {ClientId, EntityId, TICK, WORLD_HEIGHT, WORLD_WIDTH} from "@leela/common";
import JoinSystem from "./JoinSystem";
import MovementSystem from "./MovementSystem";
import SnapshotSystem from "./SnapshotSystem";

export default class Controller {

    public readonly players: Record<ClientId, EntityId>;

    public readonly join: JoinSystem;
    public readonly move: MovementSystem;
    public readonly snapshots: SnapshotSystem;

    constructor(
        public readonly network: NetworkSystem,
        public readonly world: World
    ) {
        this.players = {};

        this.join = new JoinSystem(this);
        this.move = new MovementSystem(this);
        this.snapshots = new SnapshotSystem(this);

        this.init();
    }

    private init() {
        this.spawnNpc();
    }

    private spawnNpc() {
        const char = this.world.spawnChar(5, WORLD_WIDTH / 2 - WORLD_HEIGHT / 4, WORLD_HEIGHT / 2);

        let progress = 0;

        this.network.simulations.events.on(TICK, (delta: number) => {
            console.log(delta)
            progress += delta;

            const vx = Math.sin(progress);
            const vy = Math.cos(progress);

            this.world.moveChar(char.id, vx, vy, delta);
        });
    }
}
