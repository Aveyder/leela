import SceneMoveSystem from "../world/MovementSystem";
import InterpolateSystem from "../../network/interpolation/InterpolateSystem";
import Controller from "./Controller";
import {ENTITY_ID, MOVEMENT} from "../../constants/keys";
import Interpolation from "../../network/interpolation/Interpolation";
import {Char as CharSnapshot, EntityId, move, Vec2} from "@leela/common";
import {Equals, Interpolator} from "../../network/interpolation/interpolate";
import WorldScene from "../world/WorldScene";
import Sequence from "../../network/reconcile/Sequence";
import ReconcileSystem from "../../network/reconcile/ReconcileSystem";
import {CLIENT_PREDICT, CLIENT_SMOOTH, INTERPOLATE, SHOW_ERROR} from "../../constants/config";
import Char from "../world/view/Char";
import SmoothSystem from "./SmoothSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;

const posInterpolator: Interpolator<Vec2> = (s1, s2, progress: number) => {
    const x = s1.x + (s2.x - s1.x) * progress;
    const y = s1.y + (s2.y - s1.y) * progress;

    return {x, y};
};

const posEquals: Equals<Vec2> = (s1, s2) => {
    return s1?.x == s2?.x && s1?.y == s2?.y;
}

export default class MovementSystem {

    private readonly chars: Record<EntityId, Char>;

    public readonly serverChars: Record<EntityId, Char>;
    public serverPlayer: Char;

    private readonly smooth: SmoothSystem;

    private readonly worldScene: WorldScene;
    private readonly move: SceneMoveSystem;

    private readonly interpolations: InterpolateSystem;
    private readonly reconciliation: ReconcileSystem;

    constructor(private readonly controller: Controller) {
        this.chars = controller.chars;

        this.serverChars = {};

        this.smooth = this.controller.smooth;

        this.worldScene = controller.worldScene;
        this.move = this.worldScene.move;

        this.interpolations = controller.network.interpolations;
        this.reconciliation = controller.network.reconciliation;

        this.init();
    }

    private init() {
        this.interpolations.map[MOVEMENT] = new Interpolation<Vec2>(posInterpolator, posEquals);
        this.reconciliation.sequences[MOVEMENT] = new Sequence<Vec2, Vec2>(move);

        this.worldScene.events.on(UPDATE, this.interpolateChars, this);
    }

    public handleSnapshot(snapshot: CharSnapshot): void {
        if (SHOW_ERROR) {
            const serverChar = this.serverChars[snapshot.id];
            this.worldScene.move.char(serverChar, snapshot.x, snapshot.y);
        }

        if (this.isNotPredictable(snapshot.id)) {
            this.handleNotPredictable(snapshot);
        } else {
            this.handlePredictable(snapshot);
        }
    }

    private handleNotPredictable(snapshot: CharSnapshot) {
        const char = this.chars[snapshot.id];

        if (INTERPOLATE) {
            this.interpolations.push(MOVEMENT, snapshot.id, snapshot);
        } else {
            this.move.char(char, snapshot.x, snapshot.y);
        }
    }

    private handlePredictable(snapshot: CharSnapshot) {
        const char = this.chars[snapshot.id];

        const rec = this.reconciliation.reconcile(MOVEMENT, snapshot);

        if (SHOW_ERROR) {
            this.move.char(this.serverPlayer, rec.x, rec.y);
        }

        if (CLIENT_SMOOTH) {
            this.smooth.handlePredictionError(char, rec);
        } else {
            this.move.char(char, rec.x, rec.y);
        }
    }

    private interpolateChars() {
        Object.keys(this.chars).forEach(entityId => {
            const char = this.chars[entityId];

            const charId = char.getData(ENTITY_ID) as number;

            if (INTERPOLATE && this.isNotPredictable(charId)) {
                const pos = this.interpolations.interpolate<Vec2>(MOVEMENT, charId);

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
