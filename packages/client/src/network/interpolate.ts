import {INTERPOLATE_MS, Stamp} from "@leela/common";
import Ticks from "./Ticks";
import {State} from "./types";
import {
    ENTITY_EXTRAPOLATE,
    ENTITY_EXTRAPOLATE_MAX_MS,
    ENTITY_EXTRAPOLATE_PAST,
    INTERPOLATE,
    INTERPOLATE_BUFFER_MS
} from "../constants/config";

type EntityId = string | number;
type InterpolationId = string;

interface Interpolator<S extends State> {
    (s1: S, s2: S, progress: number): S;
}

interface Snapshot<S extends State> {
    state: S,
    stamp: Stamp
}

type SnapshotBuffer<S> = Snapshot<S>[];

interface Interpolation<S extends State> {
    buffer: Record<EntityId, SnapshotBuffer<S>>;
    interpolator: Interpolator<S>;
}

class InterpolateSystem {

    private interpolations: Record<InterpolationId, Interpolation<State>>;

    constructor(
        private readonly ticks: Ticks
    ) {
        this.reset();
    }

    public register<S extends State>(id: InterpolationId, interpolator: Interpolator<S>): void {
        this.interpolations[id] = {
            buffer: {},
            interpolator
        };
    }

    public pushState(id: InterpolationId, entityId: EntityId, state: State): void {
        const interpolation = this.interpolations[id];

        const buffer = interpolation.buffer[entityId] || [];

        this.trimBuffer(buffer);

        buffer.push({
            state,
            stamp: this.ticks.server
        });

        interpolation.buffer[entityId] = buffer;
    }

    private trimBuffer(buffer: SnapshotBuffer<State>) {
        if (buffer.length > 0) {
            const now = Date.now();

            let i = 0;
            while (now - buffer[i].stamp.time > INTERPOLATE_BUFFER_MS && ++i < buffer.length);

            buffer.splice(0, i);
        }
    }

    public interpolate<S extends State>(id: InterpolationId, entityId: EntityId): S {
        const interpolation = this.interpolations[id] as Interpolation<S>;

        const buffer = interpolation.buffer[entityId];

        if (INTERPOLATE && buffer.length > 1) {
            const now = Date.now();

            const interpolationTime = now - INTERPOLATE_MS;

            let before = -1;
            const last = buffer.length - 1;
            for(let i = last; i >= 0 && before == -1; i--) {
                if (buffer[i].stamp.time < interpolationTime) {
                    before = i;
                }
            }

            let start = -1;
            if (before != -1) {
                if (before != last) {
                    start = before;
                } else if (ENTITY_EXTRAPOLATE) {
                    const extrapolate = interpolationTime - buffer[last].stamp.time <= ENTITY_EXTRAPOLATE_MAX_MS;
                    if (extrapolate) {
                        start = last - 1;
                    }
                }
            } else if (ENTITY_EXTRAPOLATE_PAST) {
                start = 0;
            }

            if (start != -1) {
                const end = start + 1;

                const s1: Snapshot<S> = buffer[start];
                const s2: Snapshot<S> = buffer[end];

                const progress = (interpolationTime - s1.stamp.time) / (s2.stamp.time - s1.stamp.time);

                return interpolation.interpolator(s1.state, s2.state, progress);
            }
        }

        return buffer.length > 0 && buffer[buffer.length - 1].state;
    }

    public reset(): void {
        this.interpolations = {};
    }
}

export {
    EntityId,
    InterpolationId,
    Interpolator,
    InterpolateSystem
};
