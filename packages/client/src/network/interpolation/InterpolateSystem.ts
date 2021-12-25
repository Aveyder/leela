import {State} from "../types";
import Ticks from "../Ticks";
import Interpolation, {EntityId} from "./Interpolation";

type InterpolationId = string;

export default class InterpolateSystem {

    public readonly map: Record<InterpolationId, Interpolation<State>>;

    constructor(
        private readonly ticks: Ticks
    ) {
        this.map = {};
    }

    public push<S extends State>(id: InterpolationId, entityId: EntityId, state: S): void {
        this.map[id].push(entityId, {
            state, timestamp: this.ticks.server.time
        });
    }

    public reset(): void {
        Object.values(this.map).forEach(interpolation => interpolation.reset());
    }
}
