import Controller from "./Controller";
import {Char, Data, EntityId, MessageSystem, Opcode, SkinId} from "@leela/common";
import MovementSystem from "./MovementSystem";
import SpawnSystem from "./SpawnSystem";

export default class SnapshotSystem {

    private readonly messages: MessageSystem;

    private readonly spawn: SpawnSystem;
    private readonly move: MovementSystem;

    constructor(private readonly controller: Controller) {
        this.messages = this.controller.network.messages;

        this.spawn = this.controller.spawn;
        this.move = this.controller.move;

        this.messages.on(Opcode.Snapshot, this.onUpdate, this);
    }

    private onUpdate(data: Data) {
        for (let i = 0; i < data.length; i += 4) {
            const char = {
                id: data[i] as EntityId,
                x: data[i + 1] as number,
                y: data[i + 2] as number,
                skin: data[i + 3] as SkinId
            } as Char;

            this.spawn.handleSnapshot(char);
            this.move.handleSnapshot(char);
        }
    }
}