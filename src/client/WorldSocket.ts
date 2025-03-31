import WorldSession from "./WorldSession";
import { Socket } from "socket.io-client";
import WorldClient, { SessionCallback } from "./WorldClient";
import * as timesync from "timesync";
import { TimeSync } from "timesync";
import WorldPacket from "../protocol/WorldPacket";
import { Opcode } from "../protocol/Opcode";
import WorldClientConfig from "./WorldClientConfig";
import Join from "../entity/Join";
import { MODELS } from "../resource/Model";

export default class WorldSocket {

    public readonly io: null | Socket;
    public readonly config: WorldClientConfig;
    private readonly callback: SessionCallback;

    private readonly bufferQueue: WorldPacket[];
    private readonly _ts: TimeSync;
    private _session: null | WorldSession;

    constructor(client: WorldClient) {
        this.io = client.io!;
        this.config = client.config;
        this.callback = client.callback!;

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
            repeat: this.config.timesyncRepeat,
            delay: this.config.timesyncDelayMs,
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
                case Opcode.SMSG_AUTH_SUCCESS: {
                    const serverStartTime = packet[1] as number;

                    this.createSession(serverStartTime);
                    break;
                }
            }
            return;
        }

        this._session.recvPacket(packet);
    }

    private createSession(serverStartTime: number) {
        this._session = new WorldSession(this, serverStartTime);

        this.callback(this._session);
    }

    public destroy() {
        if (this._session) {
            this._session.destroy();
            this._session = null;
        }

        this.bufferQueue.length = 0;

        this.io!.removeAllListeners("message");
        this.io!.removeAllListeners("timesync");

        this._ts.destroy();
    }

    public get ts(): TimeSync {
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
