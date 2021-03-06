import WorldSession from "../server/WorldSession";
import Player from "./Player";
import {generateName, Opcode, UNIT_RUN_SPEED, WorldPacket} from "@leela/common";
import {addUnitToWorld} from "../core/Unit";

function handlePlayerJoin(worldSession: WorldSession, worldPacket: WorldPacket) {
    // TODO: Manage this via required session status, drop such packets: STATUS_AUTH, STATUS_LOGON etc
    if (worldSession.player) return;

    const world = worldSession.world;

    const player = new Player(worldSession);

    const map = world.physics.map;

    player.guid = world.guid();
    player.skin = worldPacket[1] as number;
    player.name = getValidName(worldPacket[2]);
    player.x = Math.random() * map.tilesWidth * map.tileSize;
    player.y = Math.random() * map.tilesHeight * map.tileSize;
    player.vx = 0;
    player.vy = 0;
    player.tick = -1;
    player.speed = UNIT_RUN_SPEED;
    player.gold = 0;

    worldSession.player = player;

    addUnitToWorld(player);

    worldSession.sendPacket([Opcode.MSG_JOIN, player.guid])
}

function getValidName(name: unknown) {
    if (name && typeof name == "string" && name.length <= 20) {
        return name;
    } else {
        return generateName();
    }
}

export {
    handlePlayerJoin
}