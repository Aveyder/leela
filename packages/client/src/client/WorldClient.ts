import WorldScene from "../world/WorldScene";
import {io, Socket} from "socket.io-client";
import {SERVER_HOST, TIMESYNC_INTERVAL_MS} from "../config";
import * as timesync from "timesync";
import {TimeSync} from "timesync";
import WorldSocket from "./WorldSocket";
import msgpack from "socket.io-msgpack-parser";

export default class WorldClient {

    public readonly worldScene: WorldScene;

    private _socket: Socket;
    private _ts: TimeSync;

    constructor(worldScene: WorldScene) {
        this.worldScene = worldScene;
    }

    public init(): void {
        this.initIOSocket();
        this.initTimesyncClient();
    }

    private initIOSocket() {
        this._socket = io(SERVER_HOST, {
            parser: msgpack
        });

        this._socket.on("connect", () => {
            const worldSocket = new WorldSocket(this);
            worldSocket.init();
        });
    }

    private initTimesyncClient() {
        this._ts = timesync.create({
            server: this._socket,
            interval: TIMESYNC_INTERVAL_MS
        });

        this._ts.send = (socket: Socket, data, timeout) => {
            return new Promise((resolve, reject) => {
                const timeoutFn = setTimeout(reject, timeout);

                socket.emit("timesync", data, function () {
                    clearTimeout(timeoutFn);
                    resolve();
                });
            });
        };
    }

    public get socket() {
        return this._socket;
    }

    public get ts() {
        return this._ts;
    }
}
