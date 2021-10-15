import {State} from "../types";
import Ticks from "../Ticks";
import Interpolation, {EntityId} from "./Interpolation";

type InterpolationId = string;

export default class InterpolateSystem {

    public readonly interpolations: Record<InterpolationId, Interpolation<State>>;

    constructor(
        private readonly ticks: Ticks
    ) {
        this.interpolations = {};
    }

    public push<S extends State>(id: InterpolationId, entityId: EntityId, state: S): void {
        this.interpolations[id].push(entityId, {
            state, timestamp: this.ticks.server.time
        });
    }

    public reset(): void {
        Object.values(this.interpolations).forEach(interpolation => interpolation.reset());
    }
}
