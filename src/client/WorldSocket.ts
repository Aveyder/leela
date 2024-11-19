import WorldSession from "./WorldSession";
import {Socket} from "socket.io-client";
import WorldClient from "./WorldClient";
import * as timesync from "timesync";
import {TimeSync} from "timesync";
import WorldScene from "./world/WorldScene";
import WorldPacket from "../protocol/WorldPacket";
import { Opcode } from "../protocol/Opcode";
import WorldClientConfig from "./WorldClientConfig";
import { Codec } from "../protocol/_Codec";

export default class WorldSocket {

    public readonly scene: null | WorldScene;
    public readonly socket: null | Socket;
    public readonly config: WorldClientConfig;

    private readonly bufferQueue: WorldPacket[];

    private _ts: null | TimeSync;

    private session: null | WorldSession;

    constructor(client: WorldClient) {
        this.scene = client.scene;
        this.socket = client.socket!;
        this.config = client.config;

        this.bufferQueue = [];

        this._ts = this.initTimesync();

        this.session = null;

        this.socket.on("message", (worldPacket: WorldPacket) => this.handleWorldPacket(worldPacket));
        this.socket.on("disconnect", () => this.destroy());

        this.sendPacket([Opcode.CMSG_AUTH], true);
    }

    public sendObject<T>(opcode: Opcode, object: T, immediate: boolean) {
        this.sendPacket(Codec.encode(opcode, object), immediate);
    }

    public sendPacket(worldPacket: WorldPacket, immediate: boolean) {
        if (immediate) {
            this.socket!.send(worldPacket);
        } else {
            this.bufferQueue.push(worldPacket);
        }
    }

    public sendBufferedPackets() {
        if (this.bufferQueue.length === 0) return;

        this.bufferQueue.forEach(worldPacket => this.socket!.send(worldPacket));
        this.bufferQueue.length = 0;
    }

    private initTimesync() {
        const ts = timesync.create({
            server: this.socket!,
            interval: this.config.timesyncIntervalMs
        });

        ts.send = sendTimesync;

        this.socket!.on("timesync", (data) => ts.receive(null, data));

        return ts;
    }

    private handleWorldPacket(worldPacket: WorldPacket) {
        const opcode = worldPacket[0];

        if (!this.session) {
            switch (opcode) {
                case Opcode.SMSG_AUTH_SUCCESS:
                    this.createWorldSession();
                    break;
            }
            return;
        }

        this.session.recvPacket(worldPacket);
    }

    private createWorldSession() {
        this.session = new WorldSession(this);

        this.scene!.addSession(this.session);
    }

    private destroy() {
        if (this.session) {
            this.session.destroy();
            this.session = null;
            this.scene!.removeSession();
        }

        this.bufferQueue.length = 0;

        this.socket!.removeAllListeners("message");
        this.socket!.removeAllListeners("disconnect");
        this.socket!.removeAllListeners("timesync");

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
