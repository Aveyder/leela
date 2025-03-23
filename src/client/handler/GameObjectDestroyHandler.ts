import WorldPacketHandler from "../WorldPacketHandler";
import WorldPacket from "../../protocol/WorldPacket";

export default class GameObjectDestroyHandler extends WorldPacketHandler {
  public handle(packet: WorldPacket): void {
    const guid = packet[1] as number;

    this.scope.objects.deleteByGuid(guid);
  }
}
