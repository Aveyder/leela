import WorldSession from "../WorldSession";
import WorldPacket from "../../protocol/WorldPacket";
import WorldPacketHandler from "../WorldPacketHandler";

export default class UpdateRateHandler extends WorldPacketHandler {
  public handle(session: WorldSession, packet: WorldPacket): void {
    const tickrate = packet[1] as number;

    session.resetUpdateLoop(tickrate);
  }
}

