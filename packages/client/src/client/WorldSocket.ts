import WorldSession from "./WorldSession";
import {Opcode, WorldPacket} from "@leela/common";
import WorldScene from "../world/WorldScene";
import {Socket} from "socket.io-client";
import WorldClient from "./WorldClient";
import * as timesync from "timesync";
import {TimeSync} from "timesync";
import {TIMESYNC_INTERVAL_MS} from "../config";

export default class WorldSocket {

    public readonly worldScene: WorldScene;
    private readonly socket: Socket;

    private readonly bufferQueue: WorldPacket[];

    private _ts: TimeSync;

    private worldSession: WorldSession;

    constructor(worldClient: WorldClient) {
        this.worldScene = worldClient.worldScene;
        this.socket = worldClient.socket;

        this.bufferQueue = [];
    }

    public init() {
        this.initTimesync();
        this.socket.on("message", (worldPacket: WorldPacket) => this.handleWorldPacket(worldPacket));
        this.socket.on("disconnect", () => this.destroy());

        this.sendPacket([Opcode.CMSG_AUTH], true);
    }

    public sendPacket(worldPacket: WorldPacket, immediate: boolean) {
        if (immediate) {
            this.socket.send(worldPacket);
        } else {
            this.bufferQueue.push(worldPacket);
        }
    }

    public update() {
        if (this.bufferQueue.length == 0) return;
        this.bufferQueue.forEach(worldPacket => this.socket.send(worldPacket));
        this.bufferQueue.length = 0;
    }

    private initTimesync() {
        this._ts = timesync.create({
            server: this.socket,
            interval: TIMESYNC_INTERVAL_MS
        });

        this._ts.send = sendTimesync;

        this.socket.on("timesync", (data) => this._ts.receive(null, data));
    }

    private handleWorldPacket(worldPacket: WorldPacket) {
        const opcode = worldPacket[0];

        if (!this.worldSession) {
            switch (opcode) {
                case Opcode.SMSG_AUTH_SUCCESS:
                    this.createWorldSession();
                    break;
            }
            return;
        }

        this.worldSession.recvPacket(worldPacket);
    }

    private createWorldSession() {
        this.worldSession = new WorldSession(this);
        this.worldSession.init();

        this.worldScene.addSession(this.worldSession);
    }

    private destroy() {
        if (this.worldSession) {
            this.worldScene.removeSession();
            this.worldSession.destroy();
            this.worldSession = null;
        }

        this.bufferQueue.length = 0;

        this.socket.removeAllListeners("message");
        this.socket.removeAllListeners("disconnect");
        this.socket.removeAllListeners("timesync");

        this._ts.destroy();
        this._ts = null;
    }

    public get ts() {
        return this._ts;
    }
}

function sendTimesync(socket: Socket, data, timeout) {
    return new Promise((resolve: (value: void) => void, reject) => {
        const timeoutFn = setTimeout(reject, timeout);

        socket.emit("timesync", data, function () {
            clearTimeout(timeoutFn);
            resolve();
        });
    });
}
