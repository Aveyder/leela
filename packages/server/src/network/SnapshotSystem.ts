import {ClientId, SIMULATION_RATE, SNAPSHOT_RATE, TICK} from "@leela/common";
import Loop from "@leela/common/dist/loops/Loop";
import OutgoingSystem from "./OutgoingSystem";
import EventEmitter from "eventemitter3";

export default class SnapshotSystem {

    private readonly loops: Record<ClientId, Loop>;
    public readonly events: EventEmitter;

    constructor(
        private readonly outgoing: OutgoingSystem
    ) {
        this.loops = {};
        this.events = new EventEmitter();
    }

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
        const tick = this.tick.bind(this, id);
        const loop = new Loop(tick, tickrate);
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

    private tick(id: ClientId, delta: number) {
        this.events.emit(TICK, id, delta); // snapshots.generate(id)

        this.outgoing.send(id);
    }
}