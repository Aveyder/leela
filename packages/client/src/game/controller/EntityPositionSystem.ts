import InterpolateSystem from "../../network/interpolation/InterpolateSystem";
import Controller from "./Controller";
import {DIRECTION, ENTITY_ID, POSITION} from "../../constants/keys";
import Interpolation from "../../network/interpolation/Interpolation";
import {
    applySpeed,
    Char as CharSnapshot,
    cloneVec2,
    EntityId,
    Moving,
    PhysicsWorld,
    scaleVec2,
    SIMULATION_DELTA_MS,
    TICK,
    Vec2
} from "@leela/common";
import {CLIENT_PREDICT, INTERPOLATE} from "../../constants/config";
import Char from "../world/view/Char";
import {posEquals, posInterpolator} from "./position";
import PredictSystem from "../../network/prediction/PredictSystem";
import Prediction from "../../network/prediction/Prediction";
import {toVec2} from "../control";
import WorldScene from "../world/WorldScene";
import SmoothSystem from "./SmoothSystem";
import WalkSystem from "../world/WalkSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class EntityPositionSystem {

    private readonly chars: Record<EntityId, Char>;

    private readonly worldScene: WorldScene;
    private readonly walk: WalkSystem;

    private readonly physics: PhysicsWorld;

    private readonly interpolations: InterpolateSystem;
    private readonly predictions: PredictSystem;

    private smooth: SmoothSystem;

    private tmpVec2: Vec2;

    constructor(private readonly controller: Controller) {
        this.chars = controller.chars;

        this.worldScene = controller.worldScene;
        this.walk = controller.worldScene.walk;

        this.physics = controller.physics;

        this.interpolations = controller.network.interpolations;
        this.predictions = controller.network.predictions;

        this.init();
    }

    private init() {
        this.interpolations.map[POSITION] = new Interpolation<Vec2>(posInterpolator, posEquals);
        this.interpolations.map[DIRECTION] = new Interpolation<Moving>(
            (s1, s2, progress) => s1,
            (s1, s2) => false
        );

        this.tmpVec2 = {x: 0, y: 0};

        const posApplication = (state: Vec2, control: Vec2) => {
            control = cloneVec2(control, this.tmpVec2);
            control = scaleVec2(control, SIMULATION_DELTA_MS / 1000);

            applySpeed(control, control);
            return this.physics.move(state, control, state);
        }

        const posPrediction = new Prediction<Vec2, Vec2>(
            posApplication, cloneVec2, posInterpolator
        );

        this.predictions.map[POSITION] = posPrediction;

        this.smooth = new SmoothSystem(posPrediction);

        this.controller.network.simulations.events.on(TICK, this.tick, this);
        this.worldScene.events.on(UPDATE, this.update, this);
    }

    public handleSnapshot(charSnapshot: CharSnapshot): void {
        if (this.isNotPredictable(charSnapshot.id)) {
            this.handleNotPredictable(charSnapshot);
        } else {
            this.handlePredictable(charSnapshot);
        }
    }

    private handleNotPredictable(charSnapshot: CharSnapshot) {
        const char = this.chars[charSnapshot.id];

        if (INTERPOLATE) {
            this.interpolations.push(POSITION, charSnapshot.id, charSnapshot);
            this.interpolations.push(DIRECTION, charSnapshot.id, charSnapshot);
        } else {
            char.x = charSnapshot.x;
            char.y = charSnapshot.y;

            this.tmpVec2.x = charSnapshot.vx;
            this.tmpVec2.y = charSnapshot.vy;

            this.walk.char(char, this.tmpVec2);
        }
    }

    private handlePredictable(snapshot: CharSnapshot) {
        this.predictions.reconcile(POSITION, snapshot);
        this.smooth.smoothing.refreshError();
    }

    private tick() {
        const playerChar = this.controller.playerChar;

        if (CLIENT_PREDICT && playerChar) {
            const keys = this.worldScene.keys;

            const dir = toVec2(keys);

            if (dir.x != 0 || dir.y != 0) {
                this.predictions.predict(POSITION, playerChar, dir);
            }

            this.walk.char(playerChar, dir);
        }
    }

    private update(_: number, delta: number) {
        this.smooth.smoothing.smoothError(delta)
        this.interpolateChars();
    }

    private interpolateChars() {
        Object.keys(this.chars).forEach(entityId => {
            const char = this.chars[entityId];

            const charId = char.getData(ENTITY_ID) as number;

            let pos;
            if (this.isNotPredictable(charId)) {
                if (INTERPOLATE) {
                    pos = this.interpolations.interpolate<Vec2>(POSITION, charId);

                    const dir = this.interpolations.interpolate<Moving>(DIRECTION, charId);

                    if (dir) {
                        this.tmpVec2.x = dir.vx;
                        this.tmpVec2.y = dir.vy;

                        this.walk.char(char, this.tmpVec2);
                    }
                }
            } else {
                pos = this.predictions.getPrediction(POSITION);
            }

            if (pos) {
                char.x = pos.x;
                char.y = pos.y;
            }
        });
    }

    private isNotPredictable(charId: EntityId) {
        const playerCharId = this.controller.playerCharId;

        return charId != playerCharId || !CLIENT_PREDICT;
    }
}

export {
    posEquals
}
