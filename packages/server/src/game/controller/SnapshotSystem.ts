import Controller from "./Controller";
import {ClientId, Opcode, Snapshot, TICK} from "@leela/common";
import NetworkSnapshotSystem from "../../network/SnapshotSystem";
import PacketSystem from "../../network/PacketSystem";
import World from "../world/World";

export default class SnapshotSystem {

    private readonly world: World;

    private readonly snapshots: NetworkSnapshotSystem;
    private readonly packets: PacketSystem;

    constructor(private readonly controller: Controller) {
        this.world = this.controller.world;

        this.snapshots = this.controller.network.snapshots;
        this.packets = this.controller.network.packets;

        this.init();
    }

    private init() {
        this.snapshots.events.on(TICK, this.onTick, this);
    }

    private onTick(id: ClientId) {
        const snapshot = Object.keys(this.world.chars).map(entityId => this.world.chars[entityId]) as Snapshot;

        this.packets.push(id, Opcode.Snapshot, snapshot);
    }
}
