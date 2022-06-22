import WorldSession from "./WorldSession";
import {Opcode, WorldPacket} from "@leela/common";
import OpcodeTable from "./protocol/OpcodeTable";
import WorldScene from "../world/WorldScene";
import {Socket} from "socket.io-client";
import {CLIENT_CMD_LOOP} from "../config";

export default class WorldSocket {

    public readonly worldScene: WorldScene;
    public readonly socket: Socket;
    public readonly opcodeTable: OpcodeTable;

    private worldSession: WorldSession;

    private bufferQueue: WorldPacket[];

    constructor(worldScene: WorldScene, opcodeTable: OpcodeTable, socket: Socket) {
        this.worldScene = worldScene;
        this.socket = socket;
        this.opcodeTable = opcodeTable;
    }

    public init() {
        this.socket.send([Opcode.CMSG_AUTH]);

        this.socket.on("message", (worldPacket: WorldPacket) => this.handleWorldPacket(worldPacket));
    }

    private handleWorldPacket(worldPacket: WorldPacket) {
        const opcode = worldPacket[0];

        if (!this.worldSession) {
            switch (opcode) {
                case Opcode.SMSG_AUTH_SUCCESS:
                    this.createWorldSession();
                    break;
            }
        } else {
            this.worldSession.recvPacket(worldPacket);
        }
    }

    private createWorldSession() {
        this.worldSession = new WorldSession(this);
        this.worldSession.init();

        this.worldScene.addSession(this.worldSession);

        this.socket.on("disconnect", () => {
            this.worldScene.removeSession(null);

            this.worldSession.destroy();

            this.worldSession = null;
        });
    }

    public update() {
        this.bufferQueue.forEach(worldPacket => this.socket.send(worldPacket));
        this.bufferQueue.length = 0;
    }

    public sendPacket(worldPacket: WorldPacket, immediate = false) {
        if (CLIENT_CMD_LOOP && !immediate) {
            this.bufferQueue.push(worldPacket);
        } else {
            this.socket.send(worldPacket);
        }
    }
}
