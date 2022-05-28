import Controller from "./Controller";
import {ClientId, Data, EntityId, MessageSystem, Opcode} from "@leela/common";
import ConnectionSystem from "../../network/ConnectionSystem";
import World from "../world/World";
import PacketSystem from "../../network/PacketSystem";

export default class JoinSystem {

    private readonly players: Record<ClientId, EntityId>;

    private readonly world: World;

    private readonly connections: ConnectionSystem;
    private readonly packets: PacketSystem;
    private readonly messages: MessageSystem;

    constructor(private readonly controller: Controller) {
        this.players = this.controller.players;

        this.world = this.controller.world;

        this.connections = this.controller.network.connections;
        this.packets = this.controller.network.packets;
        this.messages = this.controller.network.messages;

        this.init();
    }

    private init() {
        this.connections.events.on("disconnect", this.onDisconnect, this);

        this.messages.on(Opcode.JoinRequest, this.onJoinRequest, this);
    }

    private onDisconnect(id: ClientId) {
        const entityId = this.players[id];

        this.world.deleteChar(entityId);

        delete this.players[id];

        this.packets.pushBroadcast(Opcode.Disappear, entityId);
    }

    private onJoinRequest(data: Data, id: ClientId) {
        const char = this.world.spawnChar();

        this.players[id] = char.id;

        this.packets.push(id, Opcode.JoinResponse, char);
    }
}
