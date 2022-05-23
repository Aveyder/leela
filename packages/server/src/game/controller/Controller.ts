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
        for(let i = 0; i < 5; i++) {
            this.spawnNpc(Math.random() * WORLD_WIDTH, Math.random() * WORLD_HEIGHT);
        }
    }

    private spawnNpc(x: number, y: number) {
        const char = this.world.spawnChar(5, x, y);

        let progress = 0;

        const shift = Math.random();
        const s = Math.random();

        this.network.simulations.events.on(TICK, (delta: number) => {
            progress += delta;

            const vx = Math.sin(progress / s + shift);
            const vy = Math.cos(progress + shift / s);

            this.world.moveChar(char.id, vx, vy, delta);
        });
    }
}
