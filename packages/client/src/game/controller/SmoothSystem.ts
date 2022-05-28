import Smoothing from "../../network/reconcile/smooth";
import {
    CLIENT_SMOOTH_POSITION_MAX_MS,
    CLIENT_SMOOTH_POSITION_PRECISION,
    CLIENT_SMOOTH_POSITION_THRESHOLD
} from "../../constants/config";
import {posDiff, posEquals, posInterpolator} from "./position";
import Controller from "./Controller";
import WorldScene from "../world/WorldScene";
import MovementSystem from "../world/MovementSystem";
import {Vec2} from "@leela/common";
import Char from "../world/view/Char";

export default class SmoothSystem {

    private readonly worldScene: WorldScene;

    private readonly move: MovementSystem;

    public readonly smooth: Smoothing<Vec2>;

    constructor(
        private readonly controller: Controller
    ) {
        this.worldScene = this.controller.worldScene;

        this.move = this.worldScene.move;

        this.smooth = new Smoothing<Vec2>({
            maxMs: CLIENT_SMOOTH_POSITION_MAX_MS,
            equals: posEquals,
            interpolator: posInterpolator,
            diff: posDiff,
            withinPrecision: this.withinPrecision,
            withinSmoothThreshold: this.withinSmoothThreshold
        });
    }

    public refreshError(char: Char, rec: Vec2): void {
        const snap = this.smooth.refreshError(char, rec);

        if (snap) this.move.char(char, rec.x, rec.y);
    }

    public smoothError(delta: number): void {
        const playerId = this.controller.playerId;

        if (playerId != undefined) {
            const player = this.controller.player;

            const pos = this.smooth.smoothError(delta, player);

            if (pos) {
                player.setPosition(pos.x, pos.y);
            }
        }
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
