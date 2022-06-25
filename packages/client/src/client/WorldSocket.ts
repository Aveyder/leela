import WorldSession from "./WorldSession";
import {Opcode, WorldPacket} from "@leela/common";
import WorldScene from "../world/WorldScene";
import {Socket} from "socket.io-client";
import WorldClient from "./WorldClient";
import {TimeSync} from "timesync";

export default class WorldSocket {

    public readonly worldScene: WorldScene;
    private readonly socket: Socket
    private readonly ts: TimeSync;
    private readonly bufferQueue: WorldPacket[];

    private worldSession: WorldSession;

    constructor(worldClient: WorldClient) {
        this.worldScene = worldClient.worldScene;
        this.socket = worldClient.socket;
        this.ts = worldClient.ts;

        this.bufferQueue = [];
    }

    public init() {
        this.initTimesync();
        this.socket.on("message", (worldPacket: WorldPacket) => this.handleWorldPacket(worldPacket));
        this.socket.on("disconnect", () => this.destroy());

        this.sendPacket([Opcode.CMSG_AUTH], true);
    }

    public sendPacket(worldPacket: WorldPacket, immediate) {
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
        this.socket.on("timesync", (data) => this.ts.receive(null, data));
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
    }
}
