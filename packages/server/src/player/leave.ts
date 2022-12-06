import WorldSession from "../server/WorldSession";

function handlePlayerLeave(worldSession: WorldSession) {
    const player = worldSession.player;

    player.deleteFromWorld();
}

export {
    handlePlayerLeave
}