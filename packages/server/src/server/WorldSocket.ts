import {Socket} from "socket.io";
import WorldSession from "./WorldSession";
import World from "../world/World";
import {Opcode, WorldPacket} from "@leela/common";
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
        this.socket.on("message", (worldPacket: WorldPacket) => {
            const success = this.handleWorldPacket(worldPacket);

            if (!success) {
                this.socket.disconnect();
            }
        });
    }

    private handleWorldPacket(worldPacket: WorldPacket) {
        const opcode = worldPacket[0];

        switch (opcode) {
            case Opcode.CMSG_PING:
                if (this.worldSession) {
                    this.worldSession.latency = worldPacket[1] as number;

                    this.sendPacket([Opcode.SMSG_PONG], true);

                    return true;
                }
                break;
            case Opcode.CMSG_AUTH:
                if (!this.worldSession) {
                    this.createWorldSession();

                    this.sendPacket([Opcode.SMSG_AUTH_SUCCESS]);

                    return true;
                }
                return false;
        }

        if (!this.worldSession) return false;

        const handler = this.opcodeTable.get(opcode);

        if (!handler) return false;

        this.worldSession.queuePacket(worldPacket);

        return true;
    }

    private createWorldSession() {
        this.worldSession = new WorldSession(this);
        this.worldSession.init();

        this.world.addSession(this.worldSession);

        this.socket.on("disconnect", () => {
            this.world.removeSession(this.worldSession);

            this.worldSession.destroy();

            this.worldSession = null;
        });
    }

    public update() {
        this.bufferQueue.forEach(worldPacket => this.socket.send(worldPacket));
        this.bufferQueue.length = 0;
    }

    public sendPacket(worldPacket: WorldPacket, immediate = false) {
        if (immediate) {
            this.socket.send(worldPacket);
        } else {
            this.bufferQueue.push(worldPacket);
        }
    }
}

