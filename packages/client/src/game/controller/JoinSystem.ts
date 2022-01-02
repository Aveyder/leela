import Controller from "./Controller";
import {Data, EntityId, MessageSystem, Opcode, SkinId} from "@leela/common";
import {Socket} from "socket.io-client";
import GameScene from "../scene/GameScene";
import OutgoingSystem from "../../network/OutgoingSystem";
import SpawnSystem from "./SpawnSystem";
import Char from "../scene/view/Char";
import MovementSystem from "./MovementSystem";

export default class JoinSystem {

    private readonly socket: Socket;

    private readonly messages: MessageSystem;
    private readonly outgoing: OutgoingSystem;

    private readonly chars: Record<EntityId, Char>;

    private readonly gameScene: GameScene;

    private readonly move: MovementSystem;
    private readonly spawn: SpawnSystem;

    constructor(private readonly controller: Controller) {
        this.socket = controller.network.socket;

        this.messages = controller.network.messages;
        this.outgoing = controller.network.outgoing;

        this.chars = controller.chars;

        this.gameScene = controller.gameScene;

        this.spawn = controller.spawn;
        this.move = controller.move;

        this.socket.on("disconnect", () => this.onDisconnect());

        this.messages.on(Opcode.JoinResponse, this.onJoinResponse, this);

        this.outgoing.push(Opcode.JoinRequest);
    }

    private onDisconnect() {
        const controller = this.controller;
        const playerId = controller.playerId;

        if (playerId != undefined) {
            this.spawn.charDestroy(playerId);

            controller.playerId = null;

            this.move.removePredictionError();
        }
    }

    private onJoinResponse(data: Data) {
        const entityId = data[0] as EntityId;
        const x = data[1] as number;
        const y = data[2] as number;
        const skin = data[3] as SkinId;

        this.controller.playerId = entityId;

        this.gameScene.player = this.spawn.charSpawn(entityId, x, y, skin);
    }
}
