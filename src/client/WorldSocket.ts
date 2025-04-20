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
import GameContext from "./GameContext";

export default class WorldSocket {

    private readonly context: GameContext;
    private readonly io: Socket;

    private readonly bufferQueue: WorldPacket[];

    constructor(context: GameContext) {
        this.context = context;
        this.io = context.io;

        this.bufferQueue = [];

        this.context.ts = this.initTimesync();

        this.io.on("message", (packet: WorldPacket) => this.handlePacket(packet));

        this.sendPacket([Opcode.CMSG_AUTH], true);
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

    private initTimesync() {
        const ts = timesync.create({
            server: this.io,
            repeat: this.context.config.timesyncRepeat,
            delay: this.context.config.timesyncDelayMs,
            interval: this.context.config.timesyncIntervalMs
        });

        ts.send = sendTimesync;

        this.io.on("timesync", (data) => ts.receive(null, data));

        return ts;
    }

    private handlePacket(packet: WorldPacket) {
        const opcode = packet[0];

        if (!this.context.session) {
            switch (opcode) {
                case Opcode.SMSG_AUTH_SUCCESS: {
                    const serverStartTime = packet[1] as number;

                    this.createSession(serverStartTime);
                    break;
                }
            }
            return;
        }

        this.context.session.recvPacket(packet);
    }

    private createSession(serverStartTime: number) {
        this.context.addSession(
          new WorldSession(this.context, serverStartTime)
        );
    }

    public destroy() {
        if (this.context.session) {
            this.context.session.destroy();
            this.context.session = null;
        }

        this.bufferQueue.length = 0;

        this.io.removeAllListeners("message");
        this.io.removeAllListeners("timesync");

        this.context.ts.destroy();
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
