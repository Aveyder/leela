import WorldSession from "../server/WorldSession";
import {deleteObjectFromWorld} from "../core/GameObject";

function handlePlayerLeave(worldSession: WorldSession) {
    const player = worldSession.player;

    if (!worldSession.player) return;

    deleteObjectFromWorld(player);
}

export {
    handlePlayerLeave
}