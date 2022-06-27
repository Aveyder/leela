import {Socket} from "socket.io";
import WorldSession from "./WorldSession";
import World from "../world/World";
import {Opcode, WorldPacket} from "@leela/common";
import OpcodeTable from "./protocol/OpcodeTable";


export default class WorldSocket {

    public readonly world: World;
    public readonly socket: Socket;
    private readonly bufferQueue: WorldPacket[];

    private worldSession: WorldSession;

    constructor(world: World, socket: Socket) {
        this.world = world;
        this.socket = socket;

        this.bufferQueue = [];
    }

    public init() {
        this.initTimesync(this.socket);
        this.socket.on("message", (worldPacket: WorldPacket) => this.handleWorldPacket(worldPacket));
        this.socket.on("disconnect", () => this.destroy());
    }

    public sendPacket(worldPacket: WorldPacket, immediate) {
        if (immediate) {
            this.socket.send(worldPacket);
        } else {
            this.bufferQueue.push(worldPacket);
        }
    }

    public update() {
        this.bufferQueue.forEach(worldPacket => this.socket.send(worldPacket));
        this.bufferQueue.length = 0;
    }

    private initTimesync(socket: Socket) {
        socket.on("timesync", (data) => {
            socket.emit("timesync", {
                id: data && "id" in data ? data.id : null,
                result: Date.now()
            });
        });
    }

    private handleWorldPacket(worldPacket: WorldPacket) {
        const offensive = this.doHandleWorldPacket(worldPacket);

        if (offensive) this.socket.disconnect();
    }

    private doHandleWorldPacket(worldPacket: WorldPacket) {
        const opcode = worldPacket[0];

        switch (opcode) {
            case Opcode.CMSG_PING:
                if (this.worldSession) {
                    this.worldSession.latency = worldPacket[1] as number;

                    this.sendPacket([Opcode.SMSG_PONG], true);

                    return false;
                }
                return true;
            case Opcode.CMSG_AUTH:
                if (!this.worldSession) {
                    this.createWorldSession();

                    this.sendPacket([Opcode.SMSG_AUTH_SUCCESS], true);

                    return false;
                }
                return true;
        }

        if (!this.worldSession) return true;

        const handler = OpcodeTable.INSTANCE.get(opcode);

        if (!handler) return true;

        this.worldSession.queuePacket(worldPacket);

        return false;
    }

    private createWorldSession() {
        this.worldSession = new WorldSession(this);
        this.worldSession.init();

        this.world.addSession(this.worldSession);
    }

    private destroy() {
        if (this.worldSession) {
            this.world.removeSession(this.worldSession);
            this.worldSession.destroy();
            this.worldSession = null;
        }

        this.bufferQueue.length = 0;

        this.socket.removeAllListeners("message");
        this.socket.removeAllListeners("disconnect");
        this.socket.removeAllListeners("timesync");
    }
}
