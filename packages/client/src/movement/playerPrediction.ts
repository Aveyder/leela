import Unit, {UnitState} from "../entities/Unit";
import {
    Body,
    cloneBody,
    cloneVec2,
    moveUnit,
    posInterpolator,
    scaleVec2,
    SIMULATION_DELTA,
    SIMULATION_DELTA_MS,
    TMP_VEC2,
    UNIT_BODY_HEIGHT,
    UNIT_BODY_WIDTH,
    Vec2
} from "@leela/common";
import WorldScene from "../world/WorldScene";
import {PlayerKey} from "../entities/PlayerKey";
import {posDiff} from "./position";
import {
    CLIENT_PREDICT,
    CLIENT_SMOOTH,
    CLIENT_SMOOTH_POS_ERROR_PRECISION,
    CLIENT_SMOOTH_POS_ERROR_THRESHOLD,
    CLIENT_SMOOTH_POS_MS
} from "../config";


type Control = {
    tick: number,
    dir: Vec2
};

function predictPlayerPosition(player: Unit, dir: Vec2) {
    const worldScene = player.scene as WorldScene;

    const appliedControls = player.getData(PlayerKey.PREDICTION_APPLIED_CONTROLS) as Control[];
    appliedControls.push({tick: worldScene.tick, dir});

    let lerpStart = player.getData(PlayerKey.PREDICTION_LERP_START_TIME) as number;
    let lerpDuration = player.getData(PlayerKey.PREDICTION_LERP_DURATION) as number;
    const initial = player.getData(PlayerKey.PREDICTION_INITIAL_POS) as Vec2;
    const predicted = player.getData(PlayerKey.PREDICTION_PREDICTED_BODY) as Body;
    const target = player.getData(PlayerKey.PREDICTION_TARGET_POS) as Vec2;
    const reconciled = player.getData(PlayerKey.PREDICTION_RECONCILED_BODY) as Body;

    // prediction
    initial.x = player.x;
    initial.y = player.y;

    const vec2 = cloneVec2(dir, TMP_VEC2);
    const scaledVec2 = scaleVec2(vec2, SIMULATION_DELTA);

    moveUnit(worldScene.phys, predicted, scaledVec2);
    moveUnit(worldScene.phys, reconciled, scaledVec2);

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
}

const updateBody: Body = {
    x: null,
    y: null,
    vx: null,
    vy: null,
    width: UNIT_BODY_WIDTH,
    height: UNIT_BODY_HEIGHT,
    bullet: false
};

function reconcilePlayerPosition(player: Unit, playerUpdateState: UnitState) {
    updateBody.x = playerUpdateState.x;
    updateBody.y = playerUpdateState.y;

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

        const vec2 = cloneVec2(control.dir, TMP_VEC2);

        moveUnit(physics, updateBody, scaleVec2(vec2, SIMULATION_DELTA));
    }

    player.setData(PlayerKey.PREDICTION_RECONCILED_BODY, updateBody);

    refreshPredictionError(player);
}

function updatePlayerPosition(player: Unit, delta: number) {
    if (!CLIENT_PREDICT || !player) return;

    const errorTimer = player.getData(PlayerKey.ERROR_TIMER) as number;

    const lerpStart = player.getData(PlayerKey.PREDICTION_LERP_START_TIME) as number;
    const lerpDuration = player.getData(PlayerKey.PREDICTION_LERP_DURATION) as number;

    const initial = player.getData(PlayerKey.PREDICTION_INITIAL_POS);
    const target = player.getData(PlayerKey.PREDICTION_TARGET_POS);

    smoothPredictionError(player, delta);

    const lerpProgress = Math.min(1, (Date.now() - lerpStart) / Math.abs(lerpDuration));

    if (lerpDuration != -1 || errorTimer != -1) posInterpolator(initial, target, lerpProgress, player);
    if (lerpProgress == 1 && errorTimer == -1) resetPrediction(player);
}

function refreshPredictionError(player: Unit) {
    if (!CLIENT_SMOOTH) return;

    const predicted =  player.getData(PlayerKey.PREDICTION_PREDICTED_BODY) as Vec2;
    const reconciled =  player.getData(PlayerKey.PREDICTION_RECONCILED_BODY) as Vec2;

    let errorTimer = player.getData(PlayerKey.ERROR_TIMER) as number;

    const error = posDiff(predicted, reconciled, TMP_VEC2);

    if (withinSmoothPosErrorPrecision(error)) {
        errorTimer = -1;
    } else {
        if (withinSmoothPosErrorThreshold(error)) {
            if (errorTimer == -1) {
                errorTimer = 0;
            }
        } else {
            player.x = reconciled.x;
            player.y = reconciled.y;

            resetPrediction(player);

            errorTimer = -1;
        }
    }

    player.setData(PlayerKey.ERROR_TIMER, errorTimer);
}

function smoothPredictionError(player: Unit, delta: number) {
    let errorTimer = player.getData(PlayerKey.ERROR_TIMER) as number;

    if (errorTimer != -1) {
        const predicted =  player.getData(PlayerKey.PREDICTION_PREDICTED_BODY) as Body;
        const target =  player.getData(PlayerKey.PREDICTION_TARGET_POS) as Vec2;
        const reconciled =  player.getData(PlayerKey.PREDICTION_RECONCILED_BODY) as Body;

        errorTimer += delta;

        const progress = Math.min(errorTimer / CLIENT_SMOOTH_POS_MS, 1);

        posInterpolator(predicted, reconciled, progress, target);

        const error = posDiff(target, reconciled);

        if (withinSmoothPosErrorPrecision(error)) {
            predicted.x = target.x;
            predicted.y = target.y;

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

function resetPrediction(player: Unit) {
    player.setData(PlayerKey.PREDICTION_LERP_START_TIME, -1);
    player.setData(PlayerKey.PREDICTION_LERP_DURATION, -1);

    let initialPos = player.getData(PlayerKey.PREDICTION_INITIAL_POS) as Vec2;

    if (!initialPos) {
        initialPos = {x: 0, y: 0};
    }

    initialPos.x = player.x;
    initialPos.y = player.y;

    player.setData(PlayerKey.PREDICTION_INITIAL_POS, initialPos);

    let targetPos = player.getData(PlayerKey.PREDICTION_TARGET_POS) as Vec2;

    if (!targetPos) {
        targetPos = {x: 0, y: 0};
    }

    targetPos.x = player.x;
    targetPos.y = player.y;

    player.setData(PlayerKey.PREDICTION_TARGET_POS, targetPos);

    let predictedBody = player.getData(PlayerKey.PREDICTION_PREDICTED_BODY) as Body;

    const playerBody = player.physBody as Body;

    if (!predictedBody) {
        predictedBody = {} as Body;
    }

    cloneBody(playerBody, predictedBody);

    player.setData(PlayerKey.PREDICTION_PREDICTED_BODY, predictedBody);

    let reconciledBody = player.getData(PlayerKey.PREDICTION_RECONCILED_BODY) as Body;

    if (!reconciledBody) {
        reconciledBody = updateBody;
    }

    cloneBody(playerBody, reconciledBody);

    player.setData(PlayerKey.PREDICTION_RECONCILED_BODY, reconciledBody);
    player.setData(PlayerKey.ERROR_TIMER, -1);
}

export {
    predictPlayerPosition,
    reconcilePlayerPosition,
    updatePlayerPosition,
    resetPrediction
}
