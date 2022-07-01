import WorldSession from "../server/WorldSession";
import Player from "../entities/Player";
import {
    Opcode,
    UNIT_RUN_SPEED,
    UNIT_SKINS, UNIT_WALK_SPEED,
    Vec2,
    WORLD_HEIGHT,
    WORLD_WIDTH,
    WorldPacket
} from "@leela/common";
import {addUnitToWorld} from "../entities/Unit";


function handlePlayerJoin(worldSession: WorldSession) {
    // TODO: Manage this via required session status, drop such packets: STATUS_AUTH, STATUS_LOGON etc
    if (worldSession.player) return;

    const world = worldSession.world;

    const player = new Player(worldSession);

    player.guid = world.guid();
    player.skin = Math.floor(Math.random() * UNIT_SKINS);
    player.x = Math.random() * WORLD_WIDTH;
    player.y = Math.random() * WORLD_HEIGHT;
    player.vx = 0;
    player.vy = 0;
    player.tick = -1;
    player.speed = UNIT_RUN_SPEED;

    worldSession.player = player;

    addUnitToWorld(player);

    worldSession.sendPacket([Opcode.MSG_JOIN, player.guid])
}

function handlePlayerUpdateRateChange(worldSession: WorldSession, worldPacket: WorldPacket) {
    const tickrate = worldPacket[1] as number;

    worldSession.resetUpdateLoop(tickrate);
}

function handlePlayerMove(worldSession: WorldSession, worldPacket: WorldPacket, delta: number) {
    const player = worldSession.player;

    if (!player) return;

    const tick = worldPacket[1] as number;
    const move = worldPacket[2] as number;

    const dir = deserializeMove(move);

    const physics = player.world.physics;

    physics.move(player, dir, player.speed);

    player.tick = tick;
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

    if (!player) return;

    player.run = !player.run;

    player.speed = player.run ? UNIT_RUN_SPEED : UNIT_WALK_SPEED;
}

export {
    handlePlayerJoin,
    handlePlayerUpdateRateChange,
    handlePlayerMove,
    handleSwitchWalkMode
}
