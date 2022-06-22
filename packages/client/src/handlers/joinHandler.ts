import WorldSession from "../client/WorldSession";
import {WorldPacket} from "@leela/common";

function handleJoin(worldSession: WorldSession, worldPacket: WorldPacket) {
    worldSession.playerGuid = worldPacket[1] as number;

    const worldScene = worldSession.worldScene;

    worldScene.joinGame();
}

export {
    handleJoin
}
