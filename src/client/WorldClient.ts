import WorldSocket from "./WorldSocket";
import msgpack from "socket.io-msgpack-parser";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import WorldClientConfig from "./WorldClientConfig";
import WorldSession from "./WorldSession";

export type SessionCallback = (session: WorldSession) => void;

export default class WorldClient {

    public readonly config: WorldClientConfig;

    private _io: null | Socket;
    private _socket: null | WorldSocket;

    private _callback: null | SessionCallback;

    constructor(config: WorldClientConfig) {
        this.config = config;
        this._io = null;
        this._socket = null;

        this._callback = null;
    }

    public connect(callback: SessionCallback): void {
        this._callback = callback;

        if (this._io?.connected) return;

        const opts = {} as Partial<ManagerOptions & SocketOptions>;

        if (this.config.msgpackEnabled) {
            opts.parser = msgpack;
        }

        this._io = io(this.config.serverUrl, opts);

        this._io.on("connect", () => {
            this._socket = new WorldSocket(this);

            this._io!.on("disconnect", () => {
                this._socket!.destroy();

                this._io!.removeAllListeners("disconnect");
            });
        });
    }

    public disconnect(): void {
        this._io?.disconnect();

        this._io = null;
    }

    public get io() {
        return this._io;
    }

    public get socket() {
        return this._socket;
    }

    public get callback() {
        return this._callback;
    }
}
