import WorldScene from "../world/WorldScene";
import {toVec2} from "./control";
import {Opcode, Vec2} from "@leela/common";
import {CLIENT_PREDICT} from "../config";
import {predictPlayerPosition} from "./playerPositionPrediction";


function playerControl(worldScene: WorldScene) {
    const worldSession = worldScene.worldSession;

    if (!worldSession) return;

    const player = worldSession.player;

    if (!player) return;

    const keys = worldScene.keys;

    const dir = toVec2(keys);

    if (CLIENT_PREDICT) {
        if (dir.x != 0 || dir.y != 0) {
            predictPlayerPosition(player, dir);
        }

        player.setDir(dir.x, dir.y);
    }

    worldSession.sendPacket([Opcode.CMSG_MOVE, worldScene.tick, serializeMove(dir)]);
}

function serializeMove(dir: Vec2): number {
    return (1 + dir.x) * 3 + (1 + dir.y);
}

export {
    playerControl
}