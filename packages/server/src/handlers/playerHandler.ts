import WorldSession from "../server/WorldSession";
import Player from "../entities/Player";
import {
    FRACTION_DIGITS,
    Opcode,
    scaleVec2,
    SIMULATION_DELTA_MS,
    toFixed,
    UNIT_SKINS,
    Vec2,
    WORLD_HEIGHT,
    WORLD_WIDTH,
    WorldPacket
} from "@leela/common";
import {addUnitToWorld, Unit} from "../entities/Unit";
import {moveUnit} from "../movement/movement";

function handlePlayerJoin(worldSession: WorldSession) {
    if (worldSession.player) return;

    const world = worldSession.world;

    const player = new Player(worldSession);

    player.guid = world.guid;
    player.skin = Math.floor(Math.random() * UNIT_SKINS);
    player.x = Math.random() * WORLD_WIDTH;
    player.y = Math.random() * WORLD_HEIGHT;
    player.vx = 0;
    player.vy = 0;
    player.tick = -1;

    worldSession.player = player;

    addUnitToWorld(player);

    worldSession.sendPacket([Opcode.MSG_JOIN, player.guid])
}

function handlePlayerLogout(worldSession: WorldSession) {
    if (!worldSession.player) return;

    const world = worldSession.world;
    const player = worldSession.player;

    delete world.units[player.guid];

    world.forEachSession(session => session.sendPacket([Opcode.SMSG_DESTROY, player.guid]));
}

function handlePlayerUpdateRateChange(worldSession: WorldSession, worldPacket: WorldPacket) {
    const tickrate = worldPacket[1] as number;

    worldSession.updateLoop(tickrate);
}

function handlePlayerUpdate(worldSession: WorldSession) {
    const player = worldSession.player;

    const units = worldSession.world.units;

    const packet = [Opcode.SMSG_UPDATE, Date.now(), player?.tick || -1] as WorldPacket;

    Object.values(units).forEach(unit => pushSerializedUnit(unit, packet));

    worldSession.sendPacket(packet);
}

function pushSerializedUnit(unit: Unit, worldPacket: WorldPacket) {
    worldPacket.push(
        unit.guid,
        unit.typeId,
        toFixed(unit.x, FRACTION_DIGITS),
        toFixed(unit.y, FRACTION_DIGITS),
        unit.skin,
        toFixed(unit.vx, FRACTION_DIGITS),
        toFixed(unit.vy, FRACTION_DIGITS)
    )
}

function handlePlayerMove(worldSession: WorldSession, worldPacket: WorldPacket, delta: number) {
    const player = worldSession.player;

    if (!player) return;

    const tick = worldPacket[1] as number;
    const move = worldPacket[2] as number;

    const vec2 = deserializeMove(move);

    moveUnit(player, scaleVec2(vec2, SIMULATION_DELTA_MS / 1000));

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

export {
    handlePlayerJoin,
    handlePlayerLogout,
    handlePlayerUpdateRateChange,
    handlePlayerUpdate,
    handlePlayerMove
}
