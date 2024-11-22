import WorldSession from "../WorldSession";
import WorldPacketHandler from "../WorldPacketHandler";

export default class PongHandler extends WorldPacketHandler {

    public handle(session: WorldSession): void {
        const pingStart = session.pingStart!;

        session.latency = Date.now() - pingStart;
    }
}
