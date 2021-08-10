import Ticks from "../network/Ticks";
import {SIMULATION_RATE} from "@leela/common";
import IncomingSystem from "../network/IncomingSystem";
import Loop from "@leela/common/dist/loops/Loop";

export default class SimulationSystem {

    public readonly loop: Loop;

    constructor(
        private readonly ticks: Ticks,
        private readonly incoming: IncomingSystem
    ) {
        this.loop = new Loop(
            delta => this.tick(delta), SIMULATION_RATE,
        );
    }

    private tick(delta: number) {
        this.ticks.server++;

        this.incoming.receivePackets();

        // world.tick(delta);
    }
}
