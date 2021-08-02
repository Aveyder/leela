import {adjustWithRate, ClientId, getSnapshotRate, RateTimer} from "@leela/common";
import {SNAPSHOT_RATE} from "../constants/config";
import SocketSystem from "./SocketSystem";
import {performance} from "perf_hooks";

export default class UpdateRateSystem {

    private readonly timers: Record<ClientId, RateTimer>;
    public ready: Record<ClientId, boolean>;

    constructor(
        private readonly sockets: SocketSystem
    ) {
        this.timers = {};
        this.flush();
    }

    public set(id: ClientId, updateRate: number): void {
        const rate = adjustWithRate(updateRate, getSnapshotRate());
        this.timers[id] = new RateTimer(rate, SNAPSHOT_RATE);
        console.log(`set rate: ${rate} for '${id}'`);
    }

    private p = performance.now();

    public tick(delta: number): void {
        this.sockets.getClientIds().forEach(id => {
            const timer = this.timers[id];

            this.ready[id] = !timer || timer.tick(delta);

            console.log(`#${id}# Timer: ${(timer as unknown as { timer: number })?.timer}`);
            if (this.ready[id]) {
                const now = performance.now();
                console.log(`Update ${(now - this.p) / 1000}`);
                this.p = now;
            }
        });
    }

    public flush(): void {
        this.ready = {};
    }
}
