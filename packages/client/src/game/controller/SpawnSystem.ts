import Controller from "./Controller";
import {Data, EntityId, MessageSystem, Opcode, SkinId} from "@leela/common";
import Char from "../world/view/Char";
import {Char as CharSnapshot} from "@leela/common";
import {ENTITY_ID} from "../../constants/keys";
import WorldScene from "../world/WorldScene";

export default class SpawnSystem {

    private readonly chars: Record<EntityId, Char>;

    private readonly worldScene: WorldScene;

    private readonly messages: MessageSystem;

    constructor(private readonly controller: Controller) {
        this.chars = this.controller.chars;

        this.worldScene = this.controller.worldScene;

        this.messages = this.controller.network.messages;

        this.init();
    }

    private init() {
        this.messages.on(Opcode.Disappear, this.onDisappear, this);
    }

    private onDisappear(data: Data) {
        const entityId = data[0] as EntityId;

        this.charDestroy(entityId);
    }

    public handleSnapshot(snapshot: CharSnapshot): void {
        const playerId = this.controller.playerId;
        const entityId = snapshot.id;

        if (entityId != playerId) {
            if (!this.chars[entityId]) {
                this.charSpawn(entityId, snapshot.x, snapshot.y, snapshot.skin);
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
