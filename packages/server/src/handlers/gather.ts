import WorldSession from "../server/WorldSession";
import {Opcode, WorldPacket} from "@leela/common";

function handleGatherPlant(worldSession: WorldSession, worldPacket: WorldPacket) {
    const player = worldSession.player;

    if (!player) return;

    const plantGuid = worldPacket[1] as number;

    const world = worldSession.world;

    const plant = world.plants[plantGuid];

    if (plant) {
        if (player.gathering == plant) return;

        player.gathering = plant;
        player.gatheringTimer = 0;
    } else {
        worldSession.sendPacket([Opcode.SMSG_GATHER_FAIL, plantGuid]);
    }
}

export {
    handleGatherPlant
}