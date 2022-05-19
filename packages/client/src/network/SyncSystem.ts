import {Socket} from "socket.io-client";
import {PONG} from "@leela/common";
import {SERVER_HOST, TIMESYNC_INTERVAL_MS} from "../constants/config";
import * as timesync from "timesync";
import {TimeSync} from "timesync";

export default class SyncSystem {

    public ts: TimeSync;

    public latency: number;

    constructor(
        private readonly socket: Socket
    ) {
        this.ts = timesync.create({
            server: `${SERVER_HOST}/timesync`,
            interval: TIMESYNC_INTERVAL_MS
        });

        this.latency = 0;

        this.init();
    }

    private init() {
        this.socket.on(PONG, (clientTime: number, serverTime: number) => {
            const now = Date.now();

            this.latency = now - clientTime;
        });
    }
}
