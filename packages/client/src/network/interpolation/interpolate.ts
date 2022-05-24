import Snapshot from "./Snapshot";
import {Equals, State} from "../State";

type InterpolateOptions = {
    interpolateMs?: number,
    extrapolate?: boolean,
    extrapolateMaxMs?: number,
    extrapolatePast?: boolean
};

interface Interpolator<S extends State> {
    (s1: S, s2: S, progress: number): S;
}

function interpolate<S extends State>(moment: number, buffer: Snapshot<S>[], interpolator: Interpolator<S>, equals: Equals<S>, options: InterpolateOptions): S {
    const {interpolateMs, extrapolate, extrapolateMaxMs, extrapolatePast} = options;

    const interpolationMoment = moment - interpolateMs;
    const last = buffer.length - 1;
    if (buffer.length > 1) {
        let before = -1;
        for (let i = last; i >= 0 && before == -1; i--) {
            if (buffer[i].timestamp < interpolationMoment) {
                before = i;
            }
        }

        let start = -1;
        if (before != -1) {
            if (before != last) {
                start = before;
            } else if (extrapolate) {
                const extrapolate = interpolationMoment - buffer[last].timestamp <= extrapolateMaxMs;
                if (extrapolate) {
                    start = last - 1;
                }
            }
        } else if (extrapolatePast) {
            start = 0;
        }

        if (start != -1) {
            const end = start + 1;

            const s1: Snapshot<S> = buffer[start];
            const s2: Snapshot<S> = buffer[end];

            const progress = (interpolationMoment - s1.timestamp) / (s2.timestamp - s1.timestamp);

            return interpolator(s1.state, s2.state, progress);
        }
    }

    if (buffer.length > 0) {
        const sl = buffer[last];
        const sf = buffer[0];

        if (sf.timestamp >= interpolationMoment) {
            return sf.state;
        } else {
            return sl.state;
        }
    }
}

export {
    InterpolateOptions,
    Interpolator,
    Equals,
    interpolate
};
