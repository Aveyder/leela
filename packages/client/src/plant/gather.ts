import WorldSession from "../client/WorldSession";
import {getPlayerState} from "../player/PlayerState";
import {CastBarStatus} from "./CastBar";
import {GATHER_DURATION, Opcode, WorldPacket} from "@leela/common";
import Unit from "../entities/Unit";
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

    if (playerState.gathering?.guid == plantGuid) {
        playerState.gathering = null;
        playerState.castBar.status = status;
        playerState.castBar.hide();
    }
}

function gatherPlant(player: Unit, plant: Plant) {
    const playerState = getPlayerState(player);

    if(playerState.gathering?.guid == plant.guid) return;

    playerState.gathering = plant;

    const castBar = playerState.castBar;

    castBar.show();
    castBar.status = CastBarStatus.IN_PROGRESS;
    castBar.totalTime = GATHER_DURATION;
    castBar.currentTime = 0;

    const worldSession = (player.scene as WorldScene).worldSession;

    worldSession.sendPacket([Opcode.CMSG_GATHER, plant.guid]);
}

export {
    handleGatherFail,
    handleGatherSuccess,
    gatherPlant
}