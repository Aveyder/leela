import WorldScene from "../world/WorldScene";
import {Opcode, UNIT_RUN_SPEED, UNIT_WALK_SPEED, Vec2} from "@leela/common";
import {CLIENT_PREDICT} from "../config";
import {predictPlayerPosition} from "./playerPrediction";
import Keys from "../world/Keys";
import PlayerState, {PLAYER_STATE} from "../entities/PlayerState";
import WorldSession from "../client/WorldSession";


const MOVE_INPUT_NONE = serializeMoveInput(0, 0);

function playerControl(worldScene: WorldScene) {
    const worldSession = worldScene.worldSession;

    if (!worldSession) return;

    const player = worldSession.player;

    if (!player) return;

    const dir = toVec2(worldScene.keys);

    if (CLIENT_PREDICT) {
        if (dir.x != 0 || dir.y != 0) {
            predictPlayerPosition(player, dir);
        }

        player.setDir(dir.x, dir.y);
    }

    const moveInput = serializeMoveInput(dir.x, dir.y);

    const playerState = player.getData(PLAYER_STATE) as PlayerState;

    if (playerState.lastMoveInput == MOVE_INPUT_NONE && moveInput == MOVE_INPUT_NONE) return;

    playerState.lastMoveInput = moveInput;

    worldSession.sendPacket([Opcode.CMSG_MOVE, worldScene.tick, moveInput]);
}

function toVec2(keys: Keys, result?: Vec2): Vec2 {
    if (!result) {
        result = {x: 0, y: 0};
    }

    result.x = 0;
    result.y = 0;

    if (keys.A.isDown || keys.left.isDown) {
        result.x -= 1;
    }
    if (keys.D.isDown || keys.right.isDown) {
        result.x += 1;
    }
    if (keys.W.isDown || keys.up.isDown) {
        result.y -= 1;
    }
    if (keys.S.isDown || keys.down.isDown) {
        result.y += 1;
    }

    return result;
}

function serializeMoveInput(dirX: number, dirY: number): number {
    return (1 + dirX) * 3 + (1 + dirY);
}

function switchWalkMode(worldSession: WorldSession) {
    if (!worldSession) return;

    const player = worldSession.player;

    if (!player) return;

    const playerState = player.getData(PLAYER_STATE) as PlayerState;

    playerState.run = !playerState.run;

    playerState.speed = playerState.run ? UNIT_RUN_SPEED : UNIT_WALK_SPEED;

    worldSession.sendPacket([Opcode.CMSG_SWITCH_WALK]);
}

export {
    playerControl,
    switchWalkMode
}