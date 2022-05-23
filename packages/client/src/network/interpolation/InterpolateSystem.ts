import {State} from "../State";
import Ticks from "../Ticks";
import Interpolation from "./Interpolation";
import {EntityId} from "@leela/common";
import SyncSystem from "../SyncSystem";

type InterpolationId = string;

export default class InterpolateSystem {

    public readonly map: Record<InterpolationId, Interpolation<State>>;

    constructor(
        private readonly ticks: Ticks,
        private readonly sync: SyncSystem
    ) {
        this.map = {};
    }

    public push<S extends State>(id: InterpolationId, entityId: EntityId, state: S): void {
        this.map[id].push(entityId, {
            state, timestamp: this.ticks.server.time
        });
    }

    public interpolate<S extends State>(id: InterpolationId, entityId: EntityId): S {
        return (this.map[id] as Interpolation<S>).interpolate(entityId, this.sync.ts.now());
    }

    public reset(): void {
        Object.values(this.map).forEach(interpolation => interpolation.reset());
    }
}
