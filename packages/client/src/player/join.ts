import WorldSession from "../client/WorldSession";
import {Opcode, WorldPacket} from "@leela/common";

function handleJoin(worldSession: WorldSession, worldPacket: WorldPacket) {
    worldSession.playerGuid = worldPacket[1] as number;

    worldSession.worldScene.gameMenu.showInGameMenu();
}

function join(worldSession: WorldSession) {
    worldSession.sendPacket([Opcode.MSG_JOIN]);
}

export {
    handleJoin,
    join
}
