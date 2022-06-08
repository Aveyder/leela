import Controller from "./Controller";
import {Char, ClientId, Data, MessageSystem, Opcode} from "@leela/common";
import ConnectionSystem from "../../network/ConnectionSystem";
import World from "../world/World";
import PacketSystem from "../../network/PacketSystem";

export default class JoinSystem {

    private readonly playerChars: Record<ClientId, Char>;

    private readonly world: World;

    private readonly connections: ConnectionSystem;
    private readonly packets: PacketSystem;
    private readonly messages: MessageSystem;

    constructor(private readonly controller: Controller) {
        this.playerChars = this.controller.playerChars;

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
        const char = this.playerChars[id];

        this.world.deleteChar(char);

        delete this.playerChars[id];

        this.packets.pushBroadcast(Opcode.Disappear, char.id);
    }

    private onJoinRequest(_: Data, id: ClientId) {
        const char = this.world.spawnChar();

        this.playerChars[id] = char;

        this.packets.push(id, Opcode.JoinResponse, char);
    }
}
