import SceneMoveSystem  from "../world/MovementSystem";
import InterpolateSystem from "../../network/interpolation/InterpolateSystem";
import Controller from "./Controller";
import {ENTITY_ID, MOVEMENT} from "../../constants/keys";
import Interpolation from "../../network/interpolation/Interpolation";
import {Char as CharSnapshot, CHAR_SPEED, EntityId, FRACTION_DIGITS, move, toFixed, Vec2} from "@leela/common";
import {Equals, Interpolator} from "../../network/interpolation/interpolate";
import WorldScene from "../world/WorldScene";
import Sequence from "../../network/reconcile/Sequence";
import ReconcileSystem from "../../network/reconcile/ReconcileSystem";
import {
    CLIENT_PREDICT,
    CLIENT_SMOOTH, CLIENT_SMOOTH_FUNCTION,
    CLIENT_SMOOTH_MAX_MS,
    CLIENT_SMOOTH_PRECISION,
    CLIENT_SMOOTH_SNAP_RATIO, INTERPOLATE
} from "../../constants/config";
import UPDATE = Phaser.Scenes.Events.UPDATE;
import Char from "../world/view/Char";
import {toVec2} from "../control";

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

    private readonly worldScene: WorldScene;
    private readonly move: SceneMoveSystem;

    private readonly interpolations: InterpolateSystem;
    private readonly reconciliation: ReconcileSystem;

    public error: Vec2;
    public errorTimer: number;

    constructor(private readonly controller: Controller) {
        this.chars = controller.chars;

        this.worldScene = controller.worldScene;
        this.move = this.worldScene.move;

        this.interpolations = controller.network.interpolations;
        this.reconciliation = controller.network.reconciliation;

        this.errorTimer = 0;

        this.init();
    }

    private init() {
        this.interpolations.map[MOVEMENT] = new Interpolation<Vec2>(posInterpolator, posEquals);
        this.reconciliation.sequences[MOVEMENT] = new Sequence<Vec2, Vec2>(move);

        this.worldScene.events.on(UPDATE, this.update, this);
    }

    public handleSnapshot(snapshot: CharSnapshot): void {
        if (this.isNotPredicted(snapshot.id)) {
            this.handleNotPredicted(snapshot);
        } else {
            this.handlePredicted(snapshot);
        }
    }

    private handleNotPredicted(snapshot: CharSnapshot) {
        const char = this.chars[snapshot.id];

        if (INTERPOLATE) {
            this.interpolations.push(MOVEMENT, snapshot.id, snapshot);
        } else {
            this.move.char(char, snapshot.x, snapshot.y);
        }
    }

    private handlePredicted(snapshot: CharSnapshot) {
        const char = this.chars[snapshot.id];

        const rec = this.reconciliation.reconcile(MOVEMENT, snapshot);

        if (CLIENT_SMOOTH) {
            this.handlePredictionError(char, rec);
        } else {
            this.move.char(char, rec.x, rec.y);
        }
    }

    private handlePredictionError(char: Char, rec: Vec2) {
        const errorX = Math.abs(rec.x - char.x);
        const errorY = Math.abs(rec.y - char.y);

        if (errorX > CLIENT_SMOOTH_PRECISION || errorY > CLIENT_SMOOTH_PRECISION) {
            const errorThreshold  = CHAR_SPEED * CLIENT_SMOOTH_SNAP_RATIO;
            if (errorX > errorThreshold || errorY > errorThreshold) {
                this.move.char(char, rec.x, rec.y);
                this.removePredictionError();
            } else {
                if (!posEquals(this.error, rec)) {
                    this.error = rec;
                    this.errorTimer = 0;
                }
            }
        }
    }

    private update(time: number, delta: number) {
        this.updatePlayer(delta);
        this.interpolateChars();
    }

    private updatePlayer(delta: number) {
        const playerId = this.controller.playerId;

        if (playerId != undefined) {
            if (CLIENT_PREDICT) {
                if (this.worldScene.keys) {
                    const dirVec = toVec2(this.worldScene.keys);

                    this.reconciliation.push(MOVEMENT, dirVec, delta / 1000);
                }

                if (this.error) {
                    this.smoothPlayerPosError(delta);
                }
            }
        }
    }

    private smoothPlayerPosError(delta: number) {
        const playerId = this.controller.playerId;
        const player = this.chars[playerId];

        const progress = this.errorTimer / CLIENT_SMOOTH_MAX_MS;
        const weight = Math.min(CLIENT_SMOOTH_FUNCTION(progress), 1);
        // const weight = Math.min(1, (progress - 0.5) * (progress - 0.5) * (progress - 0.5) * 4 + 0.5);

        player.setPosition(
            toFixed(player.x * (1 - weight) + this.error.x * weight, FRACTION_DIGITS),
            toFixed(player.y * (1 - weight) + this.error.y * weight, FRACTION_DIGITS)
        );

        this.errorTimer += delta;

        const offsetX = player.x - this.error.x;
        const offsetY = player.y - this.error.y;

        if (Math.abs(offsetX) < CLIENT_SMOOTH_PRECISION && Math.abs(offsetY) < CLIENT_SMOOTH_PRECISION) {
            this.removePredictionError();
        }
    }

    private interpolateChars() {
        Object.keys(this.chars).forEach(entityId => {
            const char = this.chars[entityId];

            const charId = char.getData(ENTITY_ID) as number;

            if (INTERPOLATE && this.isNotPredicted(charId)) {
                const pos = this.interpolations.interpolate<Vec2>(MOVEMENT, charId);

                if (pos) this.move.char(char, pos.x, pos.y);
            }
        });
    }

    private isNotPredicted(entityId: EntityId) {
        const playerId = this.controller.playerId;

        return entityId != playerId || !CLIENT_PREDICT;
    }

    public removePredictionError(): void {
        this.error = null;
        this.errorTimer = 0;
    }
}
