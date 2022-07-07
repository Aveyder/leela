import WorldSession from "../client/WorldSession";
import {WorldPacket} from "@leela/common";
import {getPlayerState} from "../player/PlayerState";

function handlePutGold(worldSession: WorldSession, worldPacket: WorldPacket) {
    const amount = worldPacket[1] as number;

    const player = worldSession.player;

    if (!player) return;

    const inventory = getPlayerState(player).inventory;

    inventory.putGold(amount);
}

export {
    handlePutGold
}