import WorldSocket from "./WorldSocket";
import msgpack from "socket.io-msgpack-parser";
import { io as ioClient, ManagerOptions, SocketOptions } from "socket.io-client";
import WorldSession from "./WorldSession";
import GameContext from "./GameContext";

export type SessionCallback = (session: WorldSession) => void;

export default class WorldClient {

    private readonly context: GameContext;

    constructor(context: GameContext) {
        this.context = context;
    }

    public connect(): void {
        let io = this.context.io;

        if (io?.connected) return;

        const opts = {} as Partial<ManagerOptions & SocketOptions>;

        if (this.context.config.msgpackEnabled) {
            opts.parser = msgpack;
        }

        io = ioClient(this.context.config.serverUrl, opts);

        this.context.io = io;

        io.on("connect", () => {
            this.context.socket = new WorldSocket(this.context);

            io.on("disconnect", () => {
                this.context.socket.destroy();

                io.removeAllListeners("disconnect");
            });
        });
    }

    public disconnect(): void {
        this.context.io?.disconnect();

        this.context.io = null;
    }
}
