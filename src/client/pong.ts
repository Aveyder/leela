import WorldSession from "./WorldSession";

function handlePong(session: WorldSession) {
    const pingStart = session.pingStart!;

    session.latency = Date.now() - pingStart;
}

export {
    handlePong
}
