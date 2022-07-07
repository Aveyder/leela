import WorldScene from "../world/WorldScene";
import {io, Socket} from "socket.io-client";
import {SERVER_URL} from "../config";
import WorldSocket from "./WorldSocket";
import msgpack from "socket.io-msgpack-parser";

export default class WorldClient {

    public readonly worldScene: WorldScene;

    private _socket: Socket;

    constructor(worldScene: WorldScene) {
        this.worldScene = worldScene;
    }

    public connect(): void {
        if (this._socket?.connected) return;

        this._socket = io(SERVER_URL, {
            parser: msgpack
        });

        this._socket.on("connect", () => {
            const worldSocket = new WorldSocket(this);
            worldSocket.init();

            this.worldScene.gameMenu.showJoinMenu();
        });
    }

    public disconnect(): void {
        this._socket.disconnect();

        this._socket = null;
    }

    public get socket() {
        return this._socket;
    }
}
