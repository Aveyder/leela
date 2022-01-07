import {Vec2} from "@leela/common";
import Char from "../world/view/Char";
import WorldScene from "../world/WorldScene";
import SceneMoveSystem from "../world/MovementSystem";
import Controller from "./Controller";
import {
    CLIENT_PREDICT,
    CLIENT_SMOOTH_POSITION_ERROR_THRESHOLD,
    CLIENT_SMOOTH_POSITION_MAX_MS,
    CLIENT_SMOOTH_POSITION_PRECISION
} from "../../constants/config";
import {posEquals} from "./MovementSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class SmoothSystem {

    private readonly worldScene: WorldScene;
    private readonly move: SceneMoveSystem;

    private error: Vec2;
    private errorTimer: number;

    private prevRec: Vec2;

    constructor(private readonly controller: Controller) {
        this.worldScene = controller.worldScene;
        this.move = this.worldScene.move;

        this.errorTimer = 0;

        this.init();
    }

    private init() {
        this.worldScene.events.on(UPDATE, this.update, this);
    }

    private update(time: number, delta: number) {
        const playerId = this.controller.playerId;

        if (playerId != undefined && CLIENT_PREDICT && this.error) {
            this.smoothPlayerPosError(delta);
        }
    }

    private smoothPlayerPosError(delta: number) {
        const player = this.worldScene.player;

        const weight = Math.min(this.errorTimer / CLIENT_SMOOTH_POSITION_MAX_MS, 1);

        player.setPosition(
            player.x * (1 - weight) + this.error.x * weight,
            player.y * (1 - weight) + this.error.y * weight
        );

        this.errorTimer += delta;

        const offsetX = player.x - this.error.x;
        const offsetY = player.y - this.error.y;

        if (this.withinPrecision(offsetX, offsetY)) {
            this.clearError();
        }
    }

    public handlePredictionError(char: Char, rec: Vec2): void {
        const errorX = rec.x - char.x;
        const errorY = rec.y - char.y;

        if (!this.withinPrecision(errorX, errorY)) {
            if (this.withinErrorThreshold(errorX, errorY)) {
                if (!this.error) {
                    this.errorTimer = 0;
                }
                this.error = rec;

                if (posEquals(this.prevRec, rec)) {
                    this.clearError();
                }
            } else {
                this.move.char(char, rec.x, rec.y);
                this.clearError();
            }
        }

        this.prevRec = rec;
    }

    private withinErrorThreshold(x: number, y: number) {
        return Math.abs(x) < CLIENT_SMOOTH_POSITION_ERROR_THRESHOLD &&
            Math.abs(y) < CLIENT_SMOOTH_POSITION_ERROR_THRESHOLD;
    }

    private withinPrecision(x: number, y: number) {
        return Math.abs(x) < CLIENT_SMOOTH_POSITION_PRECISION &&
            Math.abs(y) < CLIENT_SMOOTH_POSITION_PRECISION;
    }

    public clearError(): void {
        this.error = null;
        this.errorTimer = 0;
    }
}
