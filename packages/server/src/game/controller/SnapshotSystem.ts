import Controller from "./Controller";
import {Char, ClientId, FRACTION_DIGITS, Opcode, TICK, toFixed} from "@leela/common";
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
        const chars = this.world.chars;

        const data = [];

        Object.keys(chars).forEach(entityId => {
            const char = chars[entityId] as Char;

            data.push(
                char.id,
                toFixed(char.x, FRACTION_DIGITS),
                toFixed(char.y, FRACTION_DIGITS),
                char.skin
            );
        });

        this.packets.push(id, Opcode.Snapshot, data);
    }
}
