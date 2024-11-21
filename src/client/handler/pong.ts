import WorldSession from "../WorldSession";
import WorldPacketHandler from "../WorldPacketHandler";
import WorldPacket from "../../protocol/WorldPacket";

export default class PongHandler extends WorldPacketHandler {

    public handle(session: WorldSession, packet: WorldPacket): void {
        const pingStart = session.pingStart!;

        session.latency = Date.now() - pingStart;
    }
}
