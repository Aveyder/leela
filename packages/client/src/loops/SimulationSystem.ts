import Ticks from "../network/Ticks";
import {Loop, SIMULATION_RATE} from "@leela/common";

export default class SimulationSystem {

    public readonly loop: Loop;

    constructor(
        private readonly ticks: Ticks,
    ) {
        this.loop = new Loop(delta => this.tick(delta), SIMULATION_RATE)
    }

    private tick(delta: number) {
        this.ticks.client++;

        // sample input
        // simulate(delta)
    }
}
