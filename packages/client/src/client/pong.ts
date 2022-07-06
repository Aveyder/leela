import WorldSession from "./WorldSession";

function handlePong(worldSession: WorldSession) {
    const pingStart = worldSession.pingStart;

    worldSession.latency = Date.now() - pingStart;
}

export {
    handlePong
}
