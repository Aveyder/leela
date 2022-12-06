import WorldSession from "../server/WorldSession";
import {Opcode, UNIT_RUN_SPEED, UNIT_WALK_SPEED, Vec2, WorldPacket} from "@leela/common";
import {resetGathering} from "../plant/gather";


function handlePlayerMove(worldSession: WorldSession, worldPacket: WorldPacket) {
    const player = worldSession.player;

    const tick = worldPacket[1] as number;
    const move = worldPacket[2] as number;

    const dir = deserializeMove(move);

    const physics = player.world.physics;

    physics.move(player, dir, player.speed);

    player.tick = tick;

    if (player.gatheringPlant) {
        worldSession.sendPacket([Opcode.SMSG_GATHER_FAIL, player.gatheringPlant.guid]);
        resetGathering(player);
    }
}

function deserializeMove(move: number): Vec2 {
    const result = {x: 0, y: 0};

    result.x = -1;
    if (move > 2) {
        result.x = 0;
    }
    if (move > 5) {
        result.x = 1;
    }
    result.y = move - 4 - 3 * result.x;

    return result;
}

function handleSwitchWalkMode(worldSession: WorldSession) {
    const player = worldSession.player;

    player.run = !player.run;

    player.speed = player.run ? UNIT_RUN_SPEED : UNIT_WALK_SPEED;
}

export {
    handlePlayerMove,
    handleSwitchWalkMode
}
