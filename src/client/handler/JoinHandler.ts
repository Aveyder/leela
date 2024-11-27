import WorldPacketHandler from "../WorldPacketHandler";
import WorldPacket from "../../protocol/WorldPacket";

export default class JoinHandler extends WorldPacketHandler {
    public handle(packet: WorldPacket): void {
        this.scope.playerGuid = packet[1] as number;
    }
}
