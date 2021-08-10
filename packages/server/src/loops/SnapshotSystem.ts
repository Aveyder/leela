import {ClientId, SIMULATION_RATE, SNAPSHOT_RATE} from "@leela/common";
import Loop from "@leela/common/dist/loops/Loop";
import OutgoingSystem from "../network/OutgoingSystem";

export default class SnapshotSystem {

    private readonly loops: Record<ClientId, Loop>;

    constructor(
        private readonly outgoing: OutgoingSystem
    ) {}

    public set(id: ClientId, tickrate: number): void {
        let loop = this.loops[id];

        tickrate = tickrate == -1 ? SNAPSHOT_RATE == -1 ? SIMULATION_RATE : SNAPSHOT_RATE : tickrate;

        if (loop) {
            if (tickrate != loop.tickrate) {
                loop.tickrate = tickrate;
                loop.restart();
            }
        } else {
            loop = new Loop(
                () => this.tick.bind(this, id), tickrate,
            );
            loop.start();
            this.loops[id] = loop;
        }
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
