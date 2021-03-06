import WorldSession from "../client/WorldSession";
import {getPlayerState} from "../player/PlayerState";
import {CastBarStatus} from "./CastBar";
import {GATHER_DURATION, Opcode, WorldPacket} from "@leela/common";
import Unit from "../core/Unit";
import WorldScene from "../world/WorldScene";
import Plant from "./Plant";

function handleGatherFail(worldSession: WorldSession, worldPacket: WorldPacket) {
    handleGatherFinish(worldSession, worldPacket, CastBarStatus.FAIL);
}

function handleGatherSuccess(worldSession: WorldSession, worldPacket: WorldPacket) {
    handleGatherFinish(worldSession, worldPacket, CastBarStatus.SUCCESS);
}

function handleGatherFinish(worldSession: WorldSession, worldPacket: WorldPacket, status: CastBarStatus) {
    const plantGuid = worldPacket[1] as number;

    const playerState = getPlayerState(worldSession.player);

    if (playerState.gatheringPlant?.guid == plantGuid) {
        playerState.gatheringPlant = null;
        playerState.castBar.status = status;
        if (status == CastBarStatus.FAIL) playerState.castBar.description = "fail";
        playerState.castBar.hide();
    }
}

function gatherPlant(player: Unit, plant: Plant) {
    const playerState = getPlayerState(player);

    if(playerState.gatheringPlant?.guid == plant.guid) return;

    playerState.gatheringPlant = plant;

    const castBar = playerState.castBar;

    castBar.show();
    castBar.status = CastBarStatus.IN_PROGRESS;
    castBar.totalTime = GATHER_DURATION;
    castBar.currentTime = 0;
    castBar.description = "gathering";

    const worldSession = (player.scene as WorldScene).worldSession;

    worldSession.sendPacket([Opcode.CMSG_GATHER, plant.guid]);
}

export {
    handleGatherFail,
    handleGatherSuccess,
    gatherPlant
}