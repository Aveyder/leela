import {Socket} from "socket.io";
import WorldSession from "./WorldSession";
import { Opcode } from "../protocol/Opcode";
import WorldPacket from "../protocol/WorldPacket";
import OpcodeTable from "./OpcodeTable";
import WorldServer from "./WorldServer";
import { Codec } from "../protocol/_Codec";


export default class WorldSocket {

    public readonly server: WorldServer;
    public readonly socket: Socket;
    public readonly id: string;
    private readonly bufferQueue: WorldPacket[];

    public session: null | WorldSession;

    constructor(server: WorldServer, socket: Socket) {
        this.server = server;
        this.socket = socket;
        this.id = socket.id;
        this.bufferQueue = [];
        this.session = null;

        this.initTimesync(this.socket);
        this.socket.on("message", (worldPacket: WorldPacket) => this.handleWorldPacket(worldPacket));
        this.socket.on("disconnect", () => this.destroy());
    }

    public sendObject<T>(opcode: Opcode, object: T, immediate: boolean) {
        this.sendPacket(Codec.encode(opcode, object), immediate);
    }

    public sendPacket(worldPacket: WorldPacket, immediate: boolean) {
        if (immediate) {
            this.socket.send(worldPacket);
        } else {
            this.bufferQueue.push(worldPacket);
        }
    }

    public sendBufferedPackets() {
        if (this.bufferQueue.length === 0) return;

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
        const accepted = this.doHandleWorldPacket(worldPacket);

        if (!accepted) this.socket.disconnect();
    }

    private doHandleWorldPacket(worldPacket: WorldPacket) {
        const opcode = worldPacket[0];

        switch (opcode) {
            case Opcode.CMSG_PING:
                if (this.session) {
                    this.session.latency = worldPacket[1] as number;

                    this.sendPacket([Opcode.SMSG_PONG], true);

                    return true;
                }
                return false;
            case Opcode.CMSG_AUTH:
                if (!this.session) {
                    this.createWorldSession();

                    this.sendPacket([Opcode.SMSG_AUTH_SUCCESS], true);

                    return true;
                }
                return false;
        }

        if (!this.session) return false;

        const sessionStatus = OpcodeTable.getWorldSessionStatus(opcode);

        if (this.session.status != sessionStatus) return false;

        this.session.queuePacket(worldPacket);

        return true;
    }

    private createWorldSession() {
        this.session = new WorldSession(this);

        this.server.world.addSession(this.session);
    }

    private destroy() {
        if (this.session) {
            this.server.world.removeSession(this.session);
            this.session.destroy();
            this.session = null;
        }

        this.bufferQueue.length = 0;

        this.socket.removeAllListeners("message");
        this.socket.removeAllListeners("disconnect");
        this.socket.removeAllListeners("timesync");
    }
}
