import {Socket} from "socket.io-client";
import {PING} from "@leela/common";
import {PING_DELAY_MS, SERVER_HOST, TIMESYNC_INTERVAL_MS} from "../constants/config";
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

        this.startPing();
    }

    private startPing() {
        setInterval(() => {
            const start = Date.now();

            this.socket.emit(PING, () => this.latency = Date.now() - start);
        }, PING_DELAY_MS);
    }
}
