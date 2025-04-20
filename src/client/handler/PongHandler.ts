import WorldPacketHandler from "../WorldPacketHandler";

export default class PongHandler extends WorldPacketHandler {
  public handle(): void {
    const pingStart = this.context.session.pingStart;

    this.context.session.latency = Date.now() - pingStart;
  }
}
