import {Socket} from "socket.io-client";
import {PONG} from "@leela/common";
import {SERVER_HOST} from "../constants/config";
import * as timesync from "timesync";
import {TimeSync} from "timesync";

export default class SyncSystem {

    public ts: TimeSync;

    public latency: number;
    public offset: number;

    constructor(
        private readonly socket: Socket
    ) {
        this.ts = timesync.create({
            server: `${SERVER_HOST}/timesync`,
            interval: 30000
        });

        this.latency = 0;
        this.offset = 0;

        this.init();
    }

    private init() {
        this.socket.on(PONG, (clientTime: number, serverTime: number) => {
            const now = Date.now();

            this.latency = now - clientTime;
        });

        this.ts.on("change", offset => {
            this.offset = offset;
        });
    }
}
