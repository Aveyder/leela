import WorldSession from "../server/WorldSession";
import Player from "./Player";
import {Opcode, UNIT_RUN_SPEED} from "@leela/common";
import {addUnitToWorld} from "../entities/Unit";

function handlePlayerJoin(worldSession: WorldSession) {
    // TODO: Manage this via required session status, drop such packets: STATUS_AUTH, STATUS_LOGON etc
    if (worldSession.player) return;

    const world = worldSession.world;

    const player = new Player(worldSession);

    const map = world.physics.map;

    player.guid = world.guid();
    player.skin = Math.floor(Math.random() * 5);
    player.x = Math.random() * map.tilesWidth * map.tileSize;
    player.y = Math.random() * map.tilesHeight * map.tileSize;
    player.vx = 0;
    player.vy = 0;
    player.tick = -1;
    player.speed = UNIT_RUN_SPEED;

    worldSession.player = player;

    addUnitToWorld(player);

    worldSession.sendPacket([Opcode.MSG_JOIN, player.guid])
}

export {
    handlePlayerJoin
}