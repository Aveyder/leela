import Controller from "./Controller";
import {Char, ClientId, Opcode, TICK} from "@leela/common";
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

        this.snapshots.events.on(TICK, this.onTick, this);
    }

    private onTick(id: ClientId) {
        const chars = this.world.chars;

        const data = [];

        Object.keys(chars).forEach(entityId => {
            const char = chars[entityId] as Char;

            data.push(char.id, char.x, char.y, char.skin);
        });

        this.packets.push(id, Opcode.Snapshot, data);
    }
}
