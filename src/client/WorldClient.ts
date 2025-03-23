import WorldSocket from "./WorldSocket";
import msgpack from "socket.io-msgpack-parser";
import WorldScene from "./world/WorldScene";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import WorldClientConfig from "./WorldClientConfig";

export default class WorldClient {

    public readonly scene: WorldScene;
    public readonly config: WorldClientConfig;

    private _io: null | Socket;
    private _socket: null | WorldSocket;

    constructor(scene: WorldScene) {
        this.scene = scene;
        this.config = scene.config;
        this._io = null;
        this._socket = null;
    }

    public connect(): void {
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

            console.log(this._socket);
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
}
