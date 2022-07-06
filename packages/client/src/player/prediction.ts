import Unit from "../entities/Unit";
import {cloneBody, SIMULATION_DELTA_MS, TMP_VEC2, Vec2} from "@leela/common";
import WorldScene from "../world/WorldScene";
import {diff, interpolate} from "../utils/vec2";
import {
    CLIENT_PREDICT,
    CLIENT_SMOOTH,
    CLIENT_SMOOTH_POS_ERROR_PRECISION,
    CLIENT_SMOOTH_POS_ERROR_THRESHOLD,
    CLIENT_SMOOTH_POS_MS
} from "../config";
import {getPlayerState} from "./PlayerState";
import {PlayerUpdate} from "../entities/update";


function predictPlayerPosition(player: Unit, dir: Vec2) {
    const worldScene = player.scene as WorldScene;

    const playerState = getPlayerState(player);

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

    worldScene.phys.move(predictedBody, dir, playerState.speed);
    worldScene.phys.move(reconciledBody, dir, playerState.speed);

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


function reconcilePlayerPosition(player: Unit, playerUpdate: PlayerUpdate, ack: number) {
    const playerState = getPlayerState(player);

    playerState.ackTick = ack;

    const reconciledBody = playerState.reconciledBody;

    reconciledBody.x = playerUpdate.x;
    reconciledBody.y = playerUpdate.y;

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

        physics.move(reconciledBody, control.dir, playerState.speed);
    }

    refreshPredictionError(player);
}

function updatePlayerPosition(player: Unit, delta: number) {
    if (!CLIENT_PREDICT || !player) return;

    const playerState = getPlayerState(player);

    const errorTimer = playerState.errorTimer;

    const lerpStartTime = playerState.lerpStartTime;
    const lerpDuration = playerState.lerpDuration;

    const initialPos = playerState.initialPos;
    const targetPos = playerState.targetPos;

    smoothPredictionError(player, delta);

    const lerpProgress = Math.min(1, (Date.now() - lerpStartTime) / Math.abs(lerpDuration));

    if (lerpDuration != -1 || errorTimer != -1) interpolate(initialPos, targetPos, lerpProgress, player);
    if (lerpProgress == 1 && errorTimer == -1) resetPrediction(player);
}

function refreshPredictionError(player: Unit) {
    if (!CLIENT_SMOOTH) return;

    const playerState = getPlayerState(player);

    const predicted = playerState.predictedBody;
    const reconciled = playerState.reconciledBody;

    const error = diff(predicted, reconciled, TMP_VEC2);

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
    const playerState = getPlayerState(player);

    if (playerState.errorTimer != -1) {
        const predicted = playerState.predictedBody;
        const target = playerState.targetPos;
        const reconciled = playerState.reconciledBody;

        playerState.errorTimer += delta;

        const progress = Math.min(playerState.errorTimer / CLIENT_SMOOTH_POS_MS, 1);

        interpolate(predicted, reconciled, progress, target);

        const error = diff(target, reconciled);

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
    const playerState = getPlayerState(player);

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
