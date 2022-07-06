import WorldSession from "../client/WorldSession";
import {WorldPacket} from "@leela/common";

function handleJoin(worldSession: WorldSession, worldPacket: WorldPacket) {
    worldSession.playerGuid = worldPacket[1] as number;

    worldSession.worldScene.showGame();
}

export {
    handleJoin
}
