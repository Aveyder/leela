import WorldSocket from "./WorldSocket";
import msgpack from "socket.io-msgpack-parser";
import WorldScene from "./world/WorldScene";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import WorldClientConfig from "./WorldClientConfig";

export default class WorldClient {

    public readonly scene: WorldScene;
    public readonly config: WorldClientConfig;

    private _socket: null | Socket;

    constructor(scene: WorldScene) {
        this.scene = scene;
        this.config = scene.config;
        this._socket = null;
    }

    public connect(): void {
        if (this._socket?.connected) return;

        const opts = {} as Partial<ManagerOptions & SocketOptions>;

        if (this.config.msgpackEnabled) {
            opts.parser = msgpack;
        }

        this._socket = io(this.config.serverUrl, opts);

        this._socket.on("connect", () => {
            console.log(new WorldSocket(this));
        });
    }

    public disconnect(): void {
        this._socket?.disconnect();

        this._socket = null;
    }

    public get socket() {
        return this._socket;
    }
}
