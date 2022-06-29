import Unit, {SnapshotState} from "../entities/Unit";
import {
    cloneBody,
    cloneVec2,
    moveUnit,
    posInterpolator,
    scaleVec2,
    SIMULATION_DELTA,
    SIMULATION_DELTA_MS,
    TMP_VEC2,
    Vec2
} from "@leela/common";
import WorldScene from "../world/WorldScene";
import {posDiff} from "./position";
import {
    CLIENT_PREDICT,
    CLIENT_SMOOTH,
    CLIENT_SMOOTH_POS_ERROR_PRECISION,
    CLIENT_SMOOTH_POS_ERROR_THRESHOLD,
    CLIENT_SMOOTH_POS_MS
} from "../config";
import PlayerState, {PLAYER_STATE} from "../entities/PlayerState";


function predictPlayerPosition(player: Unit, dir: Vec2) {
    const worldScene = player.scene as WorldScene;

    const playerState = player.getData(PLAYER_STATE) as PlayerState;

    playerState.appliedControls.push({tick: worldScene.tick, dir});

    const lerpStartTime = playerState.lerpStartTime
    const lerpDuration = playerState.lerpDuration;
    const initialPos = playerState.initialPos;
    const predictedBody = playerState.predictedBody;
    const targetPos = playerState.targetPos;
    const reconciledBody = playerState.reconciledBody;

    // prediction
    initialPos.x = player.x;
    initialPos.y = player.y;

    const vec2 = cloneVec2(dir, TMP_VEC2);
    const scaledVec2 = scaleVec2(vec2, SIMULATION_DELTA);

    moveUnit(worldScene.phys, predictedBody, scaledVec2);
    moveUnit(worldScene.phys, reconciledBody, scaledVec2);

    targetPos.x = predictedBody.x;
    targetPos.y = predictedBody.y;

    // adjust lerp
    const now = Date.now();

    const lastLerpDuration = now - lerpStartTime;

    if (lastLerpDuration > lerpDuration) {
        playerState.lerpDuration = SIMULATION_DELTA_MS;
    } else {
        playerState.lerpDuration = 2 * SIMULATION_DELTA_MS - lastLerpDuration;
    }

    playerState.lerpStartTime = now;
}


function reconcilePlayerPosition(player: Unit, playerUpdateState: SnapshotState, ack: number) {
    const playerState = player.getData(PLAYER_STATE) as PlayerState;

    playerState.ackTick = ack;

    playerState.reconciledBody.x = playerUpdateState.x;
    playerState.reconciledBody.y = playerUpdateState.y;

    const physics = (player.scene as WorldScene).phys;

    const appliedControls = playerState.appliedControls;

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

        moveUnit(physics, playerState.reconciledBody, scaleVec2(vec2, SIMULATION_DELTA));
    }

    refreshPredictionError(player);
}

function updatePlayerPosition(player: Unit, delta: number) {
    if (!CLIENT_PREDICT || !player) return;

    const playerState = player.getData(PLAYER_STATE) as PlayerState;

    const errorTimer = playerState.errorTimer;

    const lerpStartTime = playerState.lerpStartTime;
    const lerpDuration = playerState.lerpDuration;

    const initialPos = playerState.initialPos;
    const targetPos = playerState.targetPos;

    smoothPredictionError(player, delta);

    const lerpProgress = Math.min(1, (Date.now() - lerpStartTime) / Math.abs(lerpDuration));

    if (lerpDuration != -1 || errorTimer != -1) posInterpolator(initialPos, targetPos, lerpProgress, player);
    if (lerpProgress == 1 && errorTimer == -1) resetPrediction(player);
}

function refreshPredictionError(player: Unit) {
    if (!CLIENT_SMOOTH) return;

    const playerState = player.getData(PLAYER_STATE) as PlayerState;

    const predicted = playerState.predictedBody;
    const reconciled = playerState.reconciledBody;

    const error = posDiff(predicted, reconciled, TMP_VEC2);

    if (withinSmoothPosErrorPrecision(error)) {
        playerState.errorTimer = -1;
    } else {
        if (withinSmoothPosErrorThreshold(error)) {
            if (playerState.errorTimer == -1) {
                playerState.errorTimer = 0;
            }
        } else {
            player.x = reconciled.x;
            player.y = reconciled.y;

            resetPrediction(player);

            playerState.errorTimer = -1;
        }
    }
}

function smoothPredictionError(player: Unit, delta: number) {
    const playerState = player.getData(PLAYER_STATE) as PlayerState;

    if (playerState.errorTimer != -1) {
        const predicted = playerState.predictedBody;
        const target = playerState.targetPos;
        const reconciled = playerState.reconciledBody;

        playerState.errorTimer += delta;

        const progress = Math.min(playerState.errorTimer / CLIENT_SMOOTH_POS_MS, 1);

        posInterpolator(predicted, reconciled, progress, target);

        const error = posDiff(target, reconciled);

        if (withinSmoothPosErrorPrecision(error)) {
            predicted.x = target.x;
            predicted.y = target.y;

            playerState.errorTimer = -1;
        }
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
    const playerState = player.getData(PLAYER_STATE) as PlayerState;

    playerState.lerpStartTime = -1;
    playerState.lerpDuration = -1;

    playerState.initialPos.x = player.x;
    playerState.initialPos.y = player.y;

    playerState.targetPos.x = player.x;
    playerState.targetPos.y = player.y;

    cloneBody(player.physBody, playerState.predictedBody);
    cloneBody(player.physBody, playerState.reconciledBody);

    playerState.errorTimer = -1;
}

export {
    predictPlayerPosition,
    reconcilePlayerPosition,
    updatePlayerPosition,
    resetPrediction
}
