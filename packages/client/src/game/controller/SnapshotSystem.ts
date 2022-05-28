import Controller from "./Controller";
import {Char, EntityType, MessageSystem, Opcode, Snapshot} from "@leela/common";
import EntityPositionSystem from "./EntityPositionSystem";
import SpawnSystem from "./SpawnSystem";

export default class SnapshotSystem {

    private readonly messages: MessageSystem;

    private readonly spawn: SpawnSystem;
    private readonly position: EntityPositionSystem;

    constructor(private readonly controller: Controller) {
        this.messages = this.controller.network.messages;

        this.spawn = this.controller.spawn;
        this.position = this.controller.position;

        this.init();
    }

    private init() {
        this.messages.on(Opcode.Snapshot, this.onUpdate, this);
    }

    private onUpdate(snapshot: Snapshot) {
        snapshot.forEach(entity => {
            if (entity.type == EntityType.CHAR) {
                const char = entity as Char;

                this.spawn.handleSnapshot(char);
                this.position.handleSnapshot(char);
            }
        });
    }
}
