import Ticks from "./Ticks";
import {Loop, SIMULATION_RATE, TICK} from "@leela/common";
import EventEmitter from "eventemitter3";

export default class SimulationSystem {

    public readonly loop: Loop;
    public readonly events: EventEmitter;

    constructor(
        private readonly ticks: Ticks,
    ) {
        this.loop = new Loop(delta => this.tick(delta), SIMULATION_RATE);
        this.events = new EventEmitter();
    }

    private tick(delta: number) {
        this.ticks.client++;

        this.events.emit(TICK, delta); // sample input, simulate(delta)
    }
}
