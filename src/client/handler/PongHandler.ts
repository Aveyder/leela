import WorldPacketHandler from "../WorldPacketHandler";

export default class PongHandler extends WorldPacketHandler {
    public handle(): void {
        const pingStart = this.session.pingStart!;

        this.session.latency = Date.now() - pingStart;
    }
}
