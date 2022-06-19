import Smoothing from "../../network/prediction/Smoothing";
import {
    CLIENT_SMOOTH_POSITION_MS,
    CLIENT_SMOOTH_POSITION_PRECISION,
    CLIENT_SMOOTH_POSITION_THRESHOLD
} from "../../constants/config";
import {posDiff, posEquals, posInterpolator} from "./position";
import {Vec2} from "@leela/common";
import Prediction from "../../network/prediction/Prediction";

export default class SmoothSystem {

    public readonly smoothing: Smoothing<Vec2>;

    constructor(
        private readonly prediction: Prediction<Vec2, Vec2>
    ) {
        this.smoothing = new Smoothing<Vec2>(prediction, {
            maxMs: CLIENT_SMOOTH_POSITION_MS,
            equals: posEquals,
            interpolator: posInterpolator,
            diff: posDiff,
            withinPrecision: this.withinPrecision,
            withinSmoothThreshold: this.withinSmoothThreshold
        });
    }

    private withinPrecision(error: Vec2) {
        return Math.abs(error.x) < CLIENT_SMOOTH_POSITION_PRECISION &&
            Math.abs(error.y) < CLIENT_SMOOTH_POSITION_PRECISION;
    }

    private withinSmoothThreshold(error: Vec2) {
        return Math.abs(error.x) < CLIENT_SMOOTH_POSITION_THRESHOLD &&
            Math.abs(error.y) < CLIENT_SMOOTH_POSITION_THRESHOLD;
    }
}
