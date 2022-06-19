import Controller from "./Controller";
import {Char as CharSnapshot, EntityId, MessageSystem, Opcode, SkinId} from "@leela/common";
import Char from "../world/view/Char";
import {ENTITY_ID} from "../../constants/keys";
import WorldScene from "../world/WorldScene";
import EntityPositionSystem from "./EntityPositionSystem";

export default class SpawnSystem {

    private readonly chars: Record<EntityId, Char>;

    private readonly position: EntityPositionSystem;

    private readonly worldScene: WorldScene;

    private readonly messages: MessageSystem;

    constructor(private readonly controller: Controller) {
        this.chars = this.controller.chars;

        this.position = controller.position;

        this.worldScene = this.controller.worldScene;

        this.messages = this.controller.network.messages;

        this.init();
    }

    private init() {
        this.messages.on(Opcode.Disappear, this.charDestroy, this);
    }

    public handleSnapshot(snapshot: CharSnapshot): void {
        const playerCharId = this.controller.playerCharId;
        const charId = snapshot.id;

        if (charId != playerCharId) {
            if (!this.chars[charId]) {
                this.charSpawn(charId, snapshot.x, snapshot.y, snapshot.skin);
            }
        }
    }

    public charSpawn(entityId: EntityId, x: number, y: number, skin: SkinId): Char {
        const char = this.worldScene.spawn.char(skin, x, y);

        char.setData(ENTITY_ID, entityId);

        this.chars[entityId] = char;

        return char;
    }

    public charDestroy(entityId: EntityId): void {
        const char = this.chars[entityId];

        if (char) {
            char.destroy();

            delete this.chars[entityId];
        }
    }
}
