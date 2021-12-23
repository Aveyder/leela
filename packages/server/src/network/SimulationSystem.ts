import Ticks from "./Ticks";
import {Loop, SIMULATION_RATE, TICK} from "@leela/common";
import IncomingSystem from "./IncomingSystem";
import EventEmitter from "eventemitter3";

export default class SimulationSystem {

    public readonly loop: Loop;
    public readonly events: EventEmitter;

    constructor(
        private readonly ticks: Ticks,
        private readonly incoming: IncomingSystem
    ) {
        this.loop = new Loop(
            delta => this.tick(delta), SIMULATION_RATE,
        );
        this.events = new EventEmitter();
    }

    private tick(delta: number) {
        this.ticks.server++;

        this.incoming.receivePackets();

        this.events.emit(TICK, delta); // world.tick(delta);
    }
}
