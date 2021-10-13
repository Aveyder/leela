import {State} from "../types";
import {InterpolateOptions, Interpolator} from "./interpolate";
import {
    ENTITY_EXTRAPOLATE,
    ENTITY_EXTRAPOLATE_MAX_MS,
    ENTITY_EXTRAPOLATE_PAST,
    INTERPOLATE, INTERPOLATE_BUFFER_MS
} from "../../constants/config";
import {INTERPOLATE_MS} from "@leela/common";
import Snapshot from "./Snapshot";
import {interpolate} from "./interpolate";

type EntityId = string | number;

function trim<S>(snapshots: Snapshot<S>[], thresholdMs) {
    if (snapshots.length > 0) {
        const now = Date.now();

        let i = 0;
        while (now - snapshots[i].timestamp > thresholdMs && ++i < snapshots.length) ;

        snapshots.splice(0, i);
    }
}

export default class Interpolation<S extends State> {

    private buffers: Record<EntityId, Snapshot<S>[]>;
    private readonly options: InterpolateOptions;

    constructor(
        private readonly interpolator: Interpolator<S>
    ) {
        this.buffers = {};
        this.options = {
            interpolate: INTERPOLATE,
            interpolateMs: INTERPOLATE_MS,
            extrapolate: ENTITY_EXTRAPOLATE,
            extrapolateMaxMs: ENTITY_EXTRAPOLATE_MAX_MS,
            extrapolatePast: ENTITY_EXTRAPOLATE_PAST
        };
    }

    public push(entityId: EntityId, snapshot: Snapshot<S>): void {
        const buffer = this.getBuffer(entityId);

        trim(buffer, INTERPOLATE_BUFFER_MS);
        buffer.push(snapshot);
    }

    public interpolate(id: EntityId, moment: number): S {
        return interpolate(
            moment,
            this.getBuffer(id),
            this.interpolator,
            this.options
        );
    }

    private getBuffer(id: EntityId) {
        let buffer = this.buffers[id];

        if (!buffer) {
            this.buffers[id] = buffer = [];
        }

        return buffer;
    }

    public reset(): void {
        this.buffers = {};
    }
}

export {
    EntityId,
    Interpolation
};
