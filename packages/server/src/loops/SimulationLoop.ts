import {performance} from "perf_hooks";
import Ticks from "../network/Ticks";
import {RateTimer, SIMULATION_RATE, TICK} from "@leela/common";
import EventEmitter from "eventemitter3";
import {PREPARE_SNAPSHOT, SEND_SNAPSHOT} from "../constants/events";
import {SNAPSHOT_RATE} from "../constants/config";
import IncomingSystem from "../network/IncomingSystem";

export default class SimulationLoop {

    public readonly events: EventEmitter;

    private lastSimulation: number;
    private readonly snapshotRateTimer: RateTimer;

    constructor(
        private readonly ticks: Ticks,
        private readonly incoming: IncomingSystem
    ) {
        this.events = new EventEmitter();

        this.snapshotRateTimer = new RateTimer(SNAPSHOT_RATE, SIMULATION_RATE);
    }

    public start(): void {
        this.lastSimulation = performance.now();

        setInterval(() => {
            this.ticks.server++;
            this.tick();
        }, 1000 / SIMULATION_RATE);
    }

    private tick() {
        const now = performance.now();
        const delta = (now - this.lastSimulation) / 1000;

        this.incoming.receivePackets();

        this.events.emit(TICK, delta);

        this.handleSnapshot(delta);

        this.lastSimulation = now;
    }

    private accumulatedDelta = 0;

    private handleSnapshot(delta: number) {
        console.log(`Snapshot rate timer ${(this.snapshotRateTimer as unknown as {timer: number}).timer}`)
        this.accumulatedDelta += delta;
        if (this.snapshotRateTimer.tick(delta)) {
            this.events.emit(PREPARE_SNAPSHOT, this.accumulatedDelta);
            this.events.emit(SEND_SNAPSHOT, this.accumulatedDelta);
            this.accumulatedDelta = 0;
        }
    }
}
