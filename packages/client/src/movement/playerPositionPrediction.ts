import Unit from "../entities/Unit";
import {cloneVec2, scaleVec2, SIMULATION_DELTA_MS, Unit as UnitState, Vec2} from "@leela/common";
import WorldScene from "../world/WorldScene";
import {PlayerKey} from "../entities/PlayerKey";
import {moveUnit} from "./movement";
import {posDiff, posInterpolator} from "./position";
import {
    CLIENT_PREDICT, CLIENT_SMOOTH,
    CLIENT_SMOOTH_POS_ERROR_PRECISION,
    CLIENT_SMOOTH_POS_ERROR_THRESHOLD,
    CLIENT_SMOOTH_POSITION_MS
} from "../config";


type Control = {
    tick: number,
    dir: Vec2
};

const tmpVec2 = {x: 0, y: 0};

function predictPlayerPosition(player: Unit, dir: Vec2) {
    const worldScene = player.scene as WorldScene;

    const appliedControls = player.getData(PlayerKey.PREDICTION_APPLIED_CONTROLS) as Control[];
    appliedControls.push({tick: worldScene.tick, dir});

    let lerpStart = player.getData(PlayerKey.PREDICTION_LERP_START_TIME) as number;
    let lerpDuration = player.getData(PlayerKey.PREDICTION_LERP_DURATION) as number;
    let initial = player.getData(PlayerKey.PREDICTION_INITIAL_POS) as Vec2;
    let predicted = player.getData(PlayerKey.PREDICTION_PREDICTED_POS) as Vec2;
    let target = player.getData(PlayerKey.PREDICTION_TARGET_POS) as Vec2;

    // prediction
    if (!initial) {
        initial = {x: 0, y: 0};
    }
    initial.x = player.x;
    initial.y = player.y;

    if (!predicted) {
        predicted = {x: player.x, y: player.y};
    }

    const vec2 = cloneVec2(dir, tmpVec2);

    moveUnit(worldScene.phys, predicted, scaleVec2(vec2, SIMULATION_DELTA_MS / 1000));

    if (!target) {
        target = {x: 0, y: 0};
    }

    target.x = predicted.x;
    target.y = predicted.y;

    // adjust lerp
    const now = Date.now();

    const lastLerpDuration = now - lerpStart;

    if (lastLerpDuration > lerpDuration) {
        lerpDuration = SIMULATION_DELTA_MS;
    } else {
        lerpDuration = 2 * SIMULATION_DELTA_MS - lastLerpDuration;
    }

    lerpStart = now;

    player.setData(PlayerKey.PREDICTION_LERP_START_TIME, lerpStart);
    player.setData(PlayerKey.PREDICTION_LERP_DURATION, lerpDuration);
    player.setData(PlayerKey.PREDICTION_INITIAL_POS, initial);
    player.setData(PlayerKey.PREDICTION_PREDICTED_POS, predicted);
    player.setData(PlayerKey.PREDICTION_TARGET_POS, target);
}

function reconcilePlayerPosition(player: Unit, update: UnitState) {
    const physics = (player.scene as WorldScene).phys;

    const appliedControls = player.getData(PlayerKey.PREDICTION_APPLIED_CONTROLS) as Control[];
    const ack = player.getData(PlayerKey.PREDICTION_ACK_TICK) as number;

    let ackIndex = -1;
    for (let i = 0; i < appliedControls.length; i++) {
        if (appliedControls[i].tick == ack) {
            ackIndex = i;
            break;
        }
    }

    appliedControls.splice(0, ackIndex + 1);

    for (let i = 0; i < appliedControls.length; i++) {
        const control = appliedControls[i];

        moveUnit(physics, update, scaleVec2(control.dir, SIMULATION_DELTA_MS / 1000));
    }

    player.setData(PlayerKey.PREDICTION_RECONCILED_POS, update);

    refreshPredictionError(player);
}

function lerpPredictedPlayerPosition(player: Unit, delta: number) {
    if (!CLIENT_PREDICT) return;
    if (!player) return;

    const lerpStart = player.getData(PlayerKey.PREDICTION_LERP_START_TIME) as number;
    const lerpDuration = player.getData(PlayerKey.PREDICTION_LERP_DURATION) as number;

    const initial = player.getData(PlayerKey.PREDICTION_INITIAL_POS);
    const target = player.getData(PlayerKey.PREDICTION_TARGET_POS);

    if (target) {
        smoothPredictionError(player, delta);

        const lerpProgress = Math.min(1, (Date.now() - lerpStart) / lerpDuration);

        if (lerpProgress > 0) {
            posInterpolator(initial, target, lerpProgress, player);
        }
    }
}

function refreshPredictionError(player: Unit) {
    if (!CLIENT_SMOOTH) return;

    const predicted =  player.getData(PlayerKey.PREDICTION_PREDICTED_POS) as Vec2;
    const reconciled =  player.getData(PlayerKey.PREDICTION_RECONCILED_POS) as Vec2;

    if (!predicted) return;
    if (!reconciled) return;

    let errorTimer = player.getData(PlayerKey.ERROR_TIMER) as number;

    const error = posDiff(predicted, reconciled, tmpVec2);

    if (withinSmoothPosErrorPrecision(error)) {
        errorTimer = -1;
    } else {
        if (withinSmoothPosErrorThreshold(error)) {
            if (errorTimer == -1) {
                errorTimer = 0;
            }
        } else {
            player.setData(PlayerKey.PREDICTION_PREDICTED_POS, reconciled);
            player.setData(PlayerKey.PREDICTION_TARGET_POS, reconciled);

            errorTimer = -1;
        }
    }

    player.setData(PlayerKey.ERROR_TIMER, errorTimer);
}

function smoothPredictionError(player: Unit, delta: number) {
    let errorTimer = player.getData(PlayerKey.ERROR_TIMER) as number;

    if (errorTimer >= 0) {
        const predicted =  player.getData(PlayerKey.PREDICTION_PREDICTED_POS) as Vec2;
        const target =  player.getData(PlayerKey.PREDICTION_TARGET_POS) as Vec2;
        const reconciled =  player.getData(PlayerKey.PREDICTION_RECONCILED_POS) as Vec2;

        errorTimer += delta;

        const progress = Math.min(errorTimer / CLIENT_SMOOTH_POSITION_MS, 1);

        posInterpolator(predicted, reconciled, progress, target);

        const error = posDiff(target, reconciled);

        if (withinSmoothPosErrorPrecision(error)) {
            player.setData(PlayerKey.PREDICTION_PREDICTED_POS, reconciled);

            errorTimer = -1;
        }

        player.setData(PlayerKey.ERROR_TIMER, errorTimer);
    }
}

function withinSmoothPosErrorPrecision(error: Vec2) {
    return Math.abs(error.x) < CLIENT_SMOOTH_POS_ERROR_PRECISION &&
        Math.abs(error.y) < CLIENT_SMOOTH_POS_ERROR_PRECISION;
}

function withinSmoothPosErrorThreshold(error: Vec2) {
    return Math.abs(error.x) < CLIENT_SMOOTH_POS_ERROR_THRESHOLD &&
        Math.abs(error.y) < CLIENT_SMOOTH_POS_ERROR_THRESHOLD;
}

export {
    predictPlayerPosition,
    reconcilePlayerPosition,
    lerpPredictedPlayerPosition
}
