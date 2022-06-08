import Controller from "./Controller";
import {move, PhysicsWorld, scaleVec2, SIMULATION_DELTA_MS, TICK, Vec2} from "@leela/common";
import SimulationSystem from "../../network/SimulationSystem";
import WorldScene from "../world/WorldScene";
import {toVec2} from "../control";
import {CLIENT_PREDICT} from "../../constants/config";
import {posInterpolator} from "./position";
import MovementSystem from "./MovementSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class PredictPositionSystem {

    private readonly simulations: SimulationSystem;

    private readonly worldScene: WorldScene;

    private readonly physics: PhysicsWorld;
    private readonly move: MovementSystem;

    private lerpStartTime = -1;
    private lerpDuration = -1;

    private lerpStartPos = {x: 0, y: 0};
    public lastPredictedPos: Vec2;

    private tmpVec2 = {x: 0, y: 0};

    constructor(private readonly controller: Controller) {
        this.simulations = this.controller.network.simulations;

        this.worldScene = this.controller.worldScene;

        this.physics = this.controller.physics;
        this.move = this.controller.move;

        this.init();
    }

    private init() {
        this.simulations.events.on(TICK, this.predict, this);
        this.worldScene.events.on(UPDATE, this.lerp, this);
    }

    private predict() {
        const playerChar = this.controller.playerChar;

        if (playerChar) {
            const keys = this.worldScene.keys;

            const dir = toVec2(keys);

            if (dir.x != 0 || dir.y != 0) {
                const now = Date.now();

                const lastLerpDuration = now - this.lerpStartTime;

                if (lastLerpDuration > this.lerpDuration) {
                    this.lerpDuration = SIMULATION_DELTA_MS;
                } else {
                    this.lerpDuration = 2 * SIMULATION_DELTA_MS - lastLerpDuration;
                }

                this.lerpStartTime = now;

                this.lerpStartPos.x = playerChar.x;
                this.lerpStartPos.y = playerChar.y;

                if (!this.lastPredictedPos) {
                    this.lastPredictedPos = {x: playerChar.x, y: playerChar.y};
                }

                move(scaleVec2(dir, SIMULATION_DELTA_MS / 1000), dir);
                this.physics.move(this.lastPredictedPos, dir);
            }
        }
    }

    private lerp() {
        const player = this.controller.playerChar;

        if (CLIENT_PREDICT && player != undefined && this.lastPredictedPos) {
            const lerpProgress = Math.min(1, (Date.now() - this.lerpStartTime) / this.lerpDuration);

            if (lerpProgress > 0) {
                const pos = posInterpolator(this.lerpStartPos, this.lastPredictedPos, lerpProgress, this.tmpVec2);

                this.move.char(player, pos.x, pos.y);
            }
        }
    }
}
