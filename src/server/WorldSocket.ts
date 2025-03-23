import { Socket } from "socket.io";
import WorldSession from "./WorldSession";
import { Opcode } from "../protocol/Opcode";
import WorldPacket from "../protocol/WorldPacket";
import WorldServer from "./WorldServer";

export default class WorldSocket {

    public readonly id: string;

    public readonly server: WorldServer;
    public readonly io: Socket;
    private readonly bufferQueue: WorldPacket[];
    public session: null | WorldSession;

    constructor(server: WorldServer, io: Socket) {
        this.id = io.id;

        this.server = server;
        this.io = io;
        this.bufferQueue = [];
        this.session = null;

        this.initTimesync(this.io);
        this.io.on("message", (packet: WorldPacket) => this.handlePacket(packet));

        console.log(`socket created: ${this.id}`);
    }

    public sendPacket(packet: WorldPacket, immediate: boolean) {
        if (immediate) {
            this.io.send(packet);
        } else {
            this.bufferQueue.push(packet);
        }
    }

    public sendBufferedPackets() {
        if (this.bufferQueue.length === 0) return;

        this.bufferQueue.forEach(packet => this.io.send(packet));
        this.bufferQueue.length = 0;
    }

    private initTimesync(socket: Socket) {
        socket.on("timesync", (data) => {
            socket.emit("timesync", {
                id: data.id,
                result: Date.now()
            });
        });
    }

    private handlePacket(packet: WorldPacket) {
        const accepted = this.doHandlePacket(packet);

        if (!accepted) this.io.disconnect();
    }

    private doHandlePacket(packet: WorldPacket) {
        const opcode = packet[0];

        switch (opcode) {
            case Opcode.CMSG_PING:
                if (this.session) {
                    this.session.latency = packet[1] as number;

                    this.sendPacket([Opcode.SMSG_PONG], true);

                    return true;
                }
                return false;
            case Opcode.CMSG_AUTH:
                if (!this.session) {
                    this.createSession();

                    this.sendPacket([Opcode.SMSG_AUTH_SUCCESS, this.server.startTime], true);

                    return true;
                }
                return false;
        }

        if (!this.session) return false;

        return this.session.queuePacket(packet);
    }

    private createSession() {
        this.session = new WorldSession(this);

        this.server.world.addSession(this.session);
    }

    public destroy() {
        if (this.session) {
            this.session.destroy();
            this.server.world.removeSession(this.session);
            this.session = null;
        }

        this.bufferQueue.length = 0;

        this.io.removeAllListeners("message");
        this.io.removeAllListeners("timesync");
    }
}
