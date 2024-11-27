import WorldPacket from "../../protocol/WorldPacket";
import WorldPacketHandler from "../WorldPacketHandler";

export default class UpdateRateHandler extends WorldPacketHandler {
  public handle(packet: WorldPacket): void {
    const tickrate = packet[1] as number;

    this.session.resetUpdateLoop(tickrate);
  }
}
