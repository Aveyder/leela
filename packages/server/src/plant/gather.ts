import WorldSession from "../server/WorldSession";
import {GATHER_DURATION, Opcode, WorldPacket} from "@leela/common";
import {deleteObjectFromWorld, isInWorld} from "../core/GameObject";
import {plantToItem} from "./Plant";
import Player from "../player/Player";
import {putItemToInventory} from "../inventory/putItem";

function handleGatherPlant(worldSession: WorldSession, worldPacket: WorldPacket) {
    const player = worldSession.player;

    if (!player) return;

    const plantGuid = worldPacket[1] as number;

    const world = worldSession.world;

    const plant = world.plants[plantGuid];

    if (plant) {
        if (player.gatheringPlant == plant) return;

        player.gatheringPlant = plant;
        player.gatheringTimer = 0;
    } else {
        worldSession.sendPacket([Opcode.SMSG_GATHER_FAIL, plantGuid]);
    }
}

function updateGathering(player: Player, delta: number) {
    const gatheringPlant = player.gatheringPlant;

    if (gatheringPlant) {
        player.gatheringTimer += delta;

        const worldSession = player.worldSession;

        if (!isInWorld(gatheringPlant)) {
            resetGathering(player);
            worldSession.sendPacket([Opcode.SMSG_GATHER_FAIL, gatheringPlant.guid]);
            return;
        }

        if (player.gatheringTimer >= GATHER_DURATION) {
            resetGathering(player);
            const leftStack = putItemToInventory(player, plantToItem[gatheringPlant.kind], 1);

            if (leftStack == 0) {
                deleteObjectFromWorld(gatheringPlant);
                worldSession.sendPacket([Opcode.SMSG_GATHER_SUCCESS, gatheringPlant.guid]);
            } else {
                worldSession.sendPacket([Opcode.SMSG_GATHER_FAIL, gatheringPlant.guid]);
            }
        }
    }
}

function resetGathering(player: Player) {
    player.gatheringPlant = null;
    player.gatheringTimer = 0;
}

export {
    handleGatherPlant,
    updateGathering,
    resetGathering
}