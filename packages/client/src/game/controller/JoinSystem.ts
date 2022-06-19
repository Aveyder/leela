import Controller from "./Controller";
import {Char as CharSnapshot, EntityId, MessageSystem, Opcode} from "@leela/common";
import {Socket} from "socket.io-client";
import WorldScene from "../world/WorldScene";
import OutgoingSystem from "../../network/OutgoingSystem";
import SpawnSystem from "./SpawnSystem";
import Char from "../world/view/Char";

export default class JoinSystem {

    private readonly socket: Socket;

    private readonly messages: MessageSystem;
    private readonly outgoing: OutgoingSystem;

    private readonly chars: Record<EntityId, Char>;

    private readonly worldScene: WorldScene;

    private readonly spawn: SpawnSystem;

    constructor(private readonly controller: Controller) {
        this.socket = controller.network.socket;

        this.messages = controller.network.messages;
        this.outgoing = controller.network.outgoing;

        this.chars = controller.chars;

        this.worldScene = controller.worldScene;

        this.spawn = controller.spawn;

        this.init();
    }

    private init() {
        this.outgoing.push(Opcode.JoinRequest);

        this.messages.on(Opcode.JoinResponse, this.onJoinResponse, this);

        this.socket.on("disconnect", () => this.onDisconnect());
    }

    private onDisconnect() {
        const controller = this.controller;

        const playerCharId = controller.playerCharId;

        if (playerCharId != undefined) {
            this.spawn.charDestroy(playerCharId);
            controller.playerChar = null;
            controller.playerCharId = null;
        }
    }

    private onJoinResponse(char: CharSnapshot) {
        this.controller.playerCharId = char.id;

        this.controller.playerChar = this.spawn.charSpawn(char.id, char.x, char.y, char.skin);
    }
}
