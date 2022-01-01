import Ticks from "./Ticks";
import {SIMULATION_RATE, TICK} from "@leela/common";
import EventEmitter from "eventemitter3";
import Loop from "./Loop";
import TimeStepLoop from "./TimeStepLoop";

export default class SimulationSystem {

    public readonly loop: TimeStepLoop;
    public readonly events: EventEmitter;

    constructor(
        private readonly ticks: Ticks,
    ) {
        this.loop = new TimeStepLoop(delta => this.tick(delta), SIMULATION_RATE);
        this.events = new EventEmitter();
    }

    private tick(delta: number) {
        this.ticks.client++;

        this.events.emit(TICK, delta); // sample input, simulate(delta)
    }
}
