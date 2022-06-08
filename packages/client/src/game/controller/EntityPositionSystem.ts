import InterpolateSystem from "../../network/interpolation/InterpolateSystem";
import Controller from "./Controller";
import {ENTITY_ID, POSITION} from "../../constants/keys";
import Interpolation from "../../network/interpolation/Interpolation";
import {Char as CharSnapshot, EntityId, Vec2} from "@leela/common";
import {CLIENT_PREDICT, INTERPOLATE} from "../../constants/config";
import Char from "../world/view/Char";
import {posEquals, posInterpolator} from "./position";
import SmoothSystem from "./SmoothSystem";
import PredictPositionSystem from "./PredictPositionSystem";
import MovementSystem from "./MovementSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class EntityPositionSystem {

    private readonly chars: Record<EntityId, Char>;

    private readonly smooth: SmoothSystem;
    private readonly prediction: PredictPositionSystem;
    private readonly move: MovementSystem;

    private readonly interpolations: InterpolateSystem;

    constructor(private readonly controller: Controller) {
        this.chars = controller.chars;

        this.smooth = controller.smooth;
        this.prediction = controller.predictPosition;
        this.move = controller.move;

        this.interpolations = controller.network.interpolations;

        this.init();
    }

    private init() {
        this.interpolations.map[POSITION] = new Interpolation<Vec2>(posInterpolator, posEquals);

        this.controller.worldScene.events.on(UPDATE, this.update, this);
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
        // reconciliation & smooth error
    }

    private update(_: number, delta: number) {
        this.smooth.smoothError(delta);
        this.interpolateChars();
    }

    private interpolateChars() {
        Object.keys(this.chars).forEach(entityId => {
            const char = this.chars[entityId];

            const charId = char.getData(ENTITY_ID) as number;

            if (INTERPOLATE && this.isNotPredictable(charId)) {
                const pos = this.interpolations.interpolate<Vec2>(POSITION, charId);

                if (pos) this.move.char(char, pos.x, pos.y);
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
