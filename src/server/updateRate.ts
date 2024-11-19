import WorldSession from "./WorldSession";
import WorldPacket from "../protocol/WorldPacket";

function handleUpdateRateChange(worldSession: WorldSession, worldPacket: WorldPacket) {
    const tickrate = worldPacket[1] as number;

    worldSession.resetUpdateLoop(tickrate);
}

export {
    handleUpdateRateChange
}
