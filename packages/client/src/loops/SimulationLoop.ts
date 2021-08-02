import OutgoingSystem from "../network/OutgoingSystem";
import {SIMULATION_INTERVAL_MS} from "@leela/common";
import Ticks from "../network/Ticks";

export default class SimulationLoop {

    private lastSimulation: number;

    constructor(
        private readonly ticks: Ticks,
        private readonly outgoing: OutgoingSystem
    ) {
    }

    public start(): void {
        this.lastSimulation = performance.now();

        setInterval(() => {
            this.ticks.client++;
            this.simulate();
            this.outgoing.send();
        }, SIMULATION_INTERVAL_MS);
    }

    private simulate() {
        const now = performance.now();
        const delta = now - this.lastSimulation;

        // simulate world with 'delta'

        this.lastSimulation = now;
    }
}
