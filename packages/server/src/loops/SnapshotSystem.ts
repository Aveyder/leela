import {ClientId, SIMULATION_RATE, SNAPSHOT_RATE} from "@leela/common";
import Loop from "@leela/common/dist/loops/Loop";
import OutgoingSystem from "../network/OutgoingSystem";

export default class SnapshotSystem {

    private readonly loops: Record<ClientId, Loop>;

    constructor(
        private readonly outgoing: OutgoingSystem
    ) {}

    public set(id: ClientId, tickrate: number): void {
        const loop = this.loops[id];

        tickrate = this.calcTickrate(tickrate);

        if (loop) {
            this.updateLoop(loop, tickrate);
        } else {
            this.createLoop(id, tickrate);
        }
    }

    private calcTickrate(tickrate: number) {
        return tickrate == -1 ? SNAPSHOT_RATE == -1 ? SIMULATION_RATE : SNAPSHOT_RATE : tickrate;
    }

    private updateLoop(loop: Loop, tickrate: number) {
        if (tickrate != loop.tickrate) {
            loop.tickrate = tickrate;
            loop.restart();
        }
    }

    private createLoop(id: ClientId, tickrate: number) {
        const loop = new Loop(
            () => this.tick.bind(this, id), tickrate,
        );
        loop.start();
        this.loops[id] = loop;
    }

    public remove(id: ClientId): void {
        const loop = this.loops[id];

        if (loop) {
            loop.stop();
            delete this.loops[id];
        }
    }

    private tick(id: ClientId) {
        // snapshots.generate(id)

        this.outgoing.send(id);
    }
}
