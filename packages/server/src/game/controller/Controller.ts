import World from "../world/World";
import NetworkSystem from "../../network/NetworkSystem";
import {Char, ClientId, move, scaleVec2, TICK, Vec2, WORLD_HEIGHT, WORLD_WIDTH} from "@leela/common";
import JoinSystem from "./JoinSystem";
import MovementSystem from "./MovementSystem";
import SnapshotSystem from "./SnapshotSystem";

export default class Controller {

    public readonly playerChars: Record<ClientId, Char>;

    public readonly join: JoinSystem;
    public readonly move: MovementSystem;
    public readonly snapshots: SnapshotSystem;

    private readonly tmpVec2: Vec2;

    constructor(
        public readonly network: NetworkSystem,
        public readonly world: World
    ) {
        this.playerChars = {};

        this.join = new JoinSystem(this);
        this.move = new MovementSystem(this);
        this.snapshots = new SnapshotSystem(this);

        this.tmpVec2 = {x: 0, y: 0};

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

            const dir = this.tmpVec2;

            dir.x = Math.sin(progress / s + shift);
            dir.y = Math.cos(progress + shift / s);

            this.world.moveChar(char, scaleVec2(dir, delta));
        });
    }
}
