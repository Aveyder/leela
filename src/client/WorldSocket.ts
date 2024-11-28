import WorldSession from "./WorldSession";
import { Socket } from "socket.io-client";
import WorldClient from "./WorldClient";
import * as timesync from "timesync";
import { TimeSync } from "timesync";
import WorldScene from "./world/WorldScene";
import WorldPacket from "../protocol/WorldPacket";
import { Opcode } from "../protocol/Opcode";
import WorldClientConfig from "./WorldClientConfig";

export default class WorldSocket {

    public readonly scene: WorldScene;
    public readonly io: null | Socket;
    public readonly config: WorldClientConfig;

    private readonly bufferQueue: WorldPacket[];

    private _ts: null | TimeSync;
    private _session: null | WorldSession;

    constructor(client: WorldClient) {
        this.scene = client.scene;
        this.io = client.io!;
        this.config = client.config;

        this.bufferQueue = [];

        this._ts = this.initTimesync();
        this._session = null;

        this.io.on("message", (packet: WorldPacket) => this.handlePacket(packet));

        this.sendPacket([Opcode.CMSG_AUTH], true);
    }

    public sendPacket(packet: WorldPacket, immediate: boolean) {
        if (immediate) {
            this.io!.send(packet);
        } else {
            this.bufferQueue.push(packet);
        }
    }

    public sendBufferedPackets() {
        if (this.bufferQueue.length === 0) return;

        this.bufferQueue.forEach(packet => this.io!.send(packet));
        this.bufferQueue.length = 0;
    }

    private initTimesync() {
        const ts = timesync.create({
            server: this.io!,
            interval: this.config.timesyncIntervalMs
        });

        ts.send = sendTimesync;

        this.io!.on("timesync", (data) => ts.receive(null, data));

        return ts;
    }

    private handlePacket(packet: WorldPacket) {
        const opcode = packet[0];

        if (!this._session) {
            switch (opcode) {
                case Opcode.SMSG_AUTH_SUCCESS:
                    const serverStartTime = packet[1] as number;

                    this.createSession(serverStartTime);
                    break;
            }
            return;
        }

        this._session.recvPacket(packet);
    }

    private createSession(serverStartTime: number) {
        this._session = new WorldSession(this, serverStartTime);

        this.scene!.addSession(this._session);
    }

    public destroy() {
        if (this._session) {
            this._session.destroy();
            this.scene!.removeSession();
            this._session = null;
        }

        this.bufferQueue.length = 0;

        this.io!.removeAllListeners("message");
        this.io!.removeAllListeners("timesync");

        this._ts!.destroy();
        this._ts = null;
    }

    public get ts() {
        return this._ts;
    }
}

function sendTimesync(socket: Socket, data: any, timeout: number) {
    return new Promise((resolve: (value: void) => void, reject) => {
        const timeoutFn = setTimeout(reject, timeout);

        socket.emit("timesync", data, function () {
            clearTimeout(timeoutFn);
            resolve();
        });
    });
}
