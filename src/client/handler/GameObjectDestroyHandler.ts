import WorldSession from "../WorldSession";
import WorldPacketHandler from "../WorldPacketHandler";
import WorldPacket from "../../protocol/WorldPacket";

export default class GameObjectDestroyHandler extends WorldPacketHandler {
    public handle(session: WorldSession, packet: WorldPacket): void {
        const guid = packet[1] as number;

        this.scene.objects.deleteByGuid(guid);
    }
}
