import {Socket} from "socket.io";
import WorldSession from "./WorldSession";
import World from "../world/World";
import {Opcode, PING, WorldPacket} from "@leela/common";
import OpcodeTable from "./protocol/OpcodeTable";

export default class WorldSocket {

    public readonly world: World;
    public readonly socket: Socket;
    public readonly opcodeTable: OpcodeTable;

    private worldSession: WorldSession;
    private bufferQueue: WorldPacket[];

    constructor(world: World, opcodeTable: OpcodeTable, socket: Socket) {
        this.world = world;
        this.socket = socket;
        this.opcodeTable = opcodeTable;

        this.bufferQueue = [];
    }

    public init() {
        this.socket.on(PING, callback => callback());

        this.socket.on("message", (worldPacket: WorldPacket) => this.handleWorldPacket(worldPacket));
    }

    private handleWorldPacket(worldPacket: WorldPacket) {
        const opcode = worldPacket[0];

        switch (opcode) {
            case Opcode.CMSG_AUTH:
                if (!this.worldSession) {
                    this.createWorldSession();
                    this.sendPacket([Opcode.SMSG_AUTH_SUCCESS]);
                }
                return;
        }

        if (!this.worldSession) return;

        this.worldSession.queuePacket(worldPacket);
    }

    private createWorldSession() {
        this.worldSession = new WorldSession(this);
        this.worldSession.init();

        this.world.addSession(this.worldSession);

        this.socket.on("disconnect", () => {
            this.world.removeSession(this.worldSession);

            this.worldSession.destroyWorldSession();

            this.worldSession = null;
        });
    }

    public update() {
        this.bufferQueue.forEach(worldPacket => this.socket.send(worldPacket));
        this.bufferQueue.length = 0;
    }

    public sendPacket(worldPacket: WorldPacket, immediate?: boolean) {
        if (immediate) {
            this.socket.send(worldPacket);
        } else {
            this.bufferQueue.push(worldPacket);
        }
    }
}

