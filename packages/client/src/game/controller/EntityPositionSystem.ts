import SceneMoveSystem from "../world/MovementSystem";
import InterpolateSystem from "../../network/interpolation/InterpolateSystem";
import Controller from "./Controller";
import {ENTITY_ID, POSITION} from "../../constants/keys";
import Interpolation from "../../network/interpolation/Interpolation";
import {Char as CharSnapshot, EntityId, move, Vec2} from "@leela/common";
import WorldScene from "../world/WorldScene";
import Sequence from "../../network/reconcile/Sequence";
import ReconcileSystem from "../../network/reconcile/ReconcileSystem";
import {CLIENT_PREDICT, CLIENT_SMOOTH, INTERPOLATE} from "../../constants/config";
import Char from "../world/view/Char";
import {posEquals, posInterpolator} from "./position";
import SmoothSystem from "./SmoothSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class EntityPositionSystem {

    private readonly chars: Record<EntityId, Char>;

    private readonly smooth: SmoothSystem;

    private readonly worldScene: WorldScene;
    private readonly move: SceneMoveSystem;

    private readonly interpolations: InterpolateSystem;
    private readonly reconciliation: ReconcileSystem;

    constructor(private readonly controller: Controller) {
        this.chars = controller.chars;

        this.smooth = controller.smooth;

        this.worldScene = controller.worldScene;
        this.move = this.worldScene.move;

        this.interpolations = controller.network.interpolations;
        this.reconciliation = controller.network.reconciliation;

        this.init();
    }

    private init() {
        this.interpolations.map[POSITION] = new Interpolation<Vec2>(posInterpolator, posEquals);
        this.reconciliation.sequences[POSITION] = new Sequence<Vec2, Vec2>(move);

        this.worldScene.events.on(UPDATE, this.update, this);
    }

    public handleSnapshot(snapshot: CharSnapshot): void {
        if (this.isNotPredictable(snapshot.id)) {
            this.handleNotPredictable(snapshot);
        } else {
            this.handlePredictable(snapshot);
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
        const char = this.chars[snapshot.id];

        const rec = this.reconciliation.reconcile(POSITION, snapshot);

        if (CLIENT_SMOOTH) {
            this.smooth.refreshError(char, rec);
        } else {
            char.setPosition(rec.x, rec.y);
        }
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

    private isNotPredictable(entityId: EntityId) {
        const playerId = this.controller.playerId;

        return entityId != playerId || !CLIENT_PREDICT;
    }
}

export {
    posEquals
}
