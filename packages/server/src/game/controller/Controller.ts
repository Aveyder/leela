import World from "../world/World";
import NetworkSystem from "../../network/NetworkSystem";
import {Char, ClientId, EntityId, Opcode, TICK} from "@leela/common";
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
    }
}
