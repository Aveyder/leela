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

    public init(): void {
        this._socket = io(SERVER_URL, {
            parser: msgpack
        });

        this._socket.on("connect", () => {
            const worldSocket = new WorldSocket(this);
            worldSocket.init();
        });
    }

    public get socket() {
        return this._socket;
    }
}
