import Controller from "./Controller";
import {Data, EntityId, MessageSystem, Opcode, SkinId} from "@leela/common";
import Char from "../world/view/Char";
import {Char as CharSnapshot} from "@leela/common";
import {ENTITY_ID} from "../../constants/keys";
import WorldScene from "../world/WorldScene";
import {SHOW_ERROR} from "../../constants/config";
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

        if (SHOW_ERROR) {
            this.serverCharSpawn(entityId, x, y, skin);
        }

        return char;
    }

    public charDestroy(entityId: EntityId): void {
        const char = this.chars[entityId];

        if (char) {
            char.destroy();

            delete this.chars[entityId];

            if (SHOW_ERROR) {
                this.serverCharDestroy(entityId);
            }
        }
    }

    private serverCharSpawn(entityId: EntityId, x: number, y: number, skin: SkinId) {
        const serverChar = this.worldScene.spawn.char(skin, x, y);

        this.position.serverChars[entityId] = serverChar;

        serverChar.setAlpha(0.15);
        serverChar.setTint(0x00ff00);

        if (entityId == this.controller.playerId) {
            const serverPlayer = this.worldScene.spawn.char(skin, x, y);

            this.position.serverPlayer = serverPlayer;

            serverPlayer.setAlpha(0.15);
            serverPlayer.setTint(0xff0000);
        }
    }

    private serverCharDestroy(entityId: EntityId) {
        const serverChar = this.position.serverChars[entityId];

        if (serverChar) {
            serverChar.destroy();

            delete this.position.serverChars[entityId];
        }

        if (entityId == this.controller.playerId) {
            const serverPlayer = this.position.serverPlayer;

            if (serverPlayer) serverPlayer.destroy();
        }
    }
}
