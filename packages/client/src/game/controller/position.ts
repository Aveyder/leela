import {Equals, Interpolator} from "../../network/interpolation/interpolate";
import {Vec2} from "@leela/common";
import {Diff} from "../../network/State";

const posInterpolator: Interpolator<Vec2> = (s1, s2, progress: number, result?: Vec2) => {
    if (!result) {
        result = {x: 0, y: 0};
    }
    result.x = s1.x + (s2.x - s1.x) * progress;
    result.y = s1.y + (s2.y - s1.y) * progress;

    return result;
};

const posEquals: Equals<Vec2> = (s1, s2) => {
    return s1?.x == s2?.x && s1?.y == s2?.y;
}

const posDiff: Diff<Vec2> = (s1, s2, result) => {
    if (!result) {
        result = {x: 0, y: 0};
    }
    result.x = s2.x - s1.x;
    result.y = s2.y - s1.y;

    return result;
}

export {
    posInterpolator,
    posEquals,
    posDiff
};
