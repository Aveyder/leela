import WorldSession from "./WorldSession";
import WorldPacket from "../protocol/WorldPacket";

function handleUpdateRateChange(session: WorldSession, packet: WorldPacket) {
    const tickrate = packet[1] as number;

    session.resetUpdateLoop(tickrate);
}

export {
    handleUpdateRateChange
}
