import OutgoingSystem from "../network/OutgoingSystem";
import {adjustWithRate, RateTimer, SIMULATION_RATE, TICK} from "@leela/common";
import Ticks from "../network/Ticks";
import EventEmitter from "eventemitter3";
import {SAMPLE_INPUT} from "../constants/events";
import {CLIENT_CMD_RATE} from "../constants/config";


export default class SimulationLoop {

    public readonly events: EventEmitter;

    private lastSimulation: number;
    private readonly cmdRateTimer: RateTimer;

    constructor(
        private readonly ticks: Ticks,
        private readonly outgoing: OutgoingSystem
    ) {
        this.events = new EventEmitter();

        const cmdRate = adjustWithRate(CLIENT_CMD_RATE, SIMULATION_RATE)
        this.cmdRateTimer = new RateTimer(cmdRate, SIMULATION_RATE);
    }

    public start(): void {
        this.lastSimulation = performance.now();

        setInterval(() => {
            this.ticks.client++;
            this.tick();
        }, 1000 / SIMULATION_RATE);
    }

    private tick() {
        const now = performance.now();
        const delta = (now - this.lastSimulation) / 1000;

        this.events.emit(SAMPLE_INPUT, delta);

        this.events.emit(TICK, delta);

        this.handleOutgoing(delta);

        this.lastSimulation = now;
    }

    private handleOutgoing(delta: number) {
        if (this.cmdRateTimer.tick(delta)) {
            this.outgoing.send(this.ticks.client);
        }
    }
}
