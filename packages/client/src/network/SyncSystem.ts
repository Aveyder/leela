import {Socket} from "socket.io-client";
import {PONG} from "@leela/common";
import {SYNC_CLOCK_SAMPLES} from "../constants/config";

interface Sample {
    latency: number;
    offset: number;
}

export default class SyncSystem {

    public latency: number;
    public offset: number;

    private readonly samples: Sample[];

    constructor(
        private readonly socket: Socket
    ) {
        this.latency = 0;
        this.offset = 0;

        this.samples = [];

        this.init();
    }

    private init() {
        this.socket.on(PONG, (clientTime: number, serverTime: number) => {
            const now = Date.now();

            this.latency = now - clientTime;

            this.calcOffset(serverTime, now);
        });
    }

    private calcOffset(serverTime: number, now: number) {
        const latency = this.latency;

        if (this.samples.length < SYNC_CLOCK_SAMPLES) {
            const offset = serverTime + latency / 2 - now;

            if (this.samples.length == 0) {
                this.offset = offset;
            }

            this.samples.push({latency, offset});

            if (this.samples.length == SYNC_CLOCK_SAMPLES) {
                this.samples.sort((a, b) => a.latency - b.latency);

                const osd = Math.round(0.68 * SYNC_CLOCK_SAMPLES);
                const left = SYNC_CLOCK_SAMPLES - osd;
                const start = (left - left % 2) / 2;

                let offsetSum = 0;
                for(let i = start; i < start + osd; i++) {
                    offsetSum += this.samples[i].offset;
                }

                this.offset = offsetSum / osd;
            }
        }
    }
}
