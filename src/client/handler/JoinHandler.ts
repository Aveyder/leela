import WorldSession from "../WorldSession";
import WorldPacketHandler from "../WorldPacketHandler";
import WorldPacket from "../../protocol/WorldPacket";

export default class JoinHandler extends WorldPacketHandler {

    public handle(session: WorldSession, packet: WorldPacket): void {
        session.scope.playerGuid = packet[1] as number;
    }
}
