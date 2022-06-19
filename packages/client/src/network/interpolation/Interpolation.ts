import {State} from "../State";
import {Equals, interpolate, InterpolateOptions, Interpolator} from "./interpolate";
import {
    ENTITY_EXTRAPOLATE,
    ENTITY_EXTRAPOLATE_MAX_MS,
    ENTITY_EXTRAPOLATE_PAST,
    INTERPOLATE_BUFFER_MS,
    INTERPOLATE_DROP_DUPLICATES,
    INTERPOLATE_DROP_DUPLICATES_MAX
} from "../../constants/config";
import {EntityId, INTERPOLATE_MS} from "@leela/common";
import Snapshot from "./Snapshot";
import {deduplicate} from "./deduplicate";

function trim<S>(snapshots: Snapshot<S>[], thresholdMs) {
    if (snapshots.length > 0) {
        const now = Date.now();

        let i = 0;
        while (now - snapshots[i].timestamp > thresholdMs && ++i < snapshots.length) ;

        snapshots.splice(0, i);
    }
}

export default class Interpolation<S extends State> {

    private static readonly DEFAULT_OPTIONS = {
        interpolateMs: INTERPOLATE_MS,
        extrapolate: ENTITY_EXTRAPOLATE,
        extrapolateMaxMs: ENTITY_EXTRAPOLATE_MAX_MS,
        extrapolatePast: ENTITY_EXTRAPOLATE_PAST
    };

    private buffers: Record<EntityId, Snapshot<S>[]>;

    constructor(
        private readonly interpolator: Interpolator<S>,
        private readonly equals: Equals<S>,
        private readonly options?: InterpolateOptions
    ) {
        this.buffers = {};

        this.options = this.options ? {
            ...Interpolation.DEFAULT_OPTIONS,
            ...this.options
        } : Interpolation.DEFAULT_OPTIONS;
    }

    public push(entityId: EntityId, snapshot: Snapshot<S>): void {
        const buffer = this.getBuffer(entityId);

        trim(buffer, INTERPOLATE_BUFFER_MS);

        if (INTERPOLATE_DROP_DUPLICATES) {
            deduplicate(buffer, snapshot, this.equals, INTERPOLATE_DROP_DUPLICATES_MAX)
        }

        buffer.push(snapshot);
    }

    public interpolate(id: EntityId, moment: number): S {
        return interpolate(
            moment,
            this.getBuffer(id),
            this.interpolator,
            this.equals,
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
    Interpolation
};
