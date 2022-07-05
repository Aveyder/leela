import WorldSession from "../client/WorldSession";
import {getState} from "../entities/PlayerState";
import {CastBarStatus} from "../entities/CastBar";
import {WorldPacket} from "@leela/common";

function handleGatherFail(worldSession: WorldSession, worldPacket: WorldPacket) {
    handleGatherFinish(worldSession, worldPacket, CastBarStatus.FAIL);
}

function handleGatherSuccess(worldSession: WorldSession, worldPacket: WorldPacket) {
    handleGatherFinish(worldSession, worldPacket, CastBarStatus.SUCCESS);
}

function handleGatherFinish(worldSession: WorldSession, worldPacket: WorldPacket, status: CastBarStatus) {
    const plantGuid = worldPacket[1] as number;

    const playerState = getState(worldSession.player);

    if (playerState.gathering?.guid == plantGuid) {
        playerState.gathering = null;
        playerState.castBar.status = status;
        playerState.castBar.hide();
    }
}

export {
    handleGatherFail,
    handleGatherSuccess
}