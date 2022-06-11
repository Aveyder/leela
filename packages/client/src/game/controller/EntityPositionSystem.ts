import InterpolateSystem from "../../network/interpolation/InterpolateSystem";
import Controller from "./Controller";
import {ENTITY_ID, POSITION} from "../../constants/keys";
import Interpolation from "../../network/interpolation/Interpolation";
import {
    Char as CharSnapshot,
    cloneVec2,
    EntityId,
    move,
    PhysicsWorld,
    scaleVec2,
    SIMULATION_DELTA_MS,
    TICK,
    Vec2
} from "@leela/common";
import {CLIENT_PREDICT, INTERPOLATE} from "../../constants/config";
import Char from "../world/view/Char";
import {posEquals, posInterpolator} from "./position";
import MovementSystem from "./MovementSystem";
import PredictSystem from "../../network/prediction/PredictSystem";
import Prediction from "../../network/prediction/Prediction";
import {toVec2} from "../control";
import WorldScene from "../world/WorldScene";
import SmoothSystem from "./SmoothSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class EntityPositionSystem {

    private readonly chars: Record<EntityId, Char>;

    private readonly worldScene: WorldScene;

    private readonly move: MovementSystem;
    private readonly physics: PhysicsWorld;

    private readonly interpolations: InterpolateSystem;
    private readonly predictions: PredictSystem;

    private smooth: SmoothSystem;

    private tmpVec2: Vec2;

    constructor(private readonly controller: Controller) {
        this.chars = controller.chars;

        this.worldScene = controller.worldScene;

        this.move = controller.move;
        this.physics = controller.physics;

        this.interpolations = controller.network.interpolations;
        this.predictions = controller.network.predictions;

        this.init();
    }

    private init() {
        this.interpolations.map[POSITION] = new Interpolation<Vec2>(posInterpolator, posEquals);

        this.tmpVec2 = {x: 0, y: 0};

        const posApplication = (state: Vec2, control: Vec2) => {
            control = cloneVec2(control, this.tmpVec2);

            move(scaleVec2(control, SIMULATION_DELTA_MS / 1000), control);
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

    private handleNotPredictable(snapshot: CharSnapshot) {
        const char = this.chars[snapshot.id];

        if (INTERPOLATE) {
            this.interpolations.push(POSITION, snapshot.id, snapshot);
        } else {
            this.move.char(char, snapshot.x, snapshot.y);
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
                if (INTERPOLATE) pos = this.interpolations.interpolate<Vec2>(POSITION, charId);
            } else {
                pos = this.predictions.getPrediction(POSITION);
            }

            if (pos) this.move.char(char, pos.x, pos.y);
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
