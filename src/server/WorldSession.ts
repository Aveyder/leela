import WorldSocket from "./WorldSocket";
import WorldPacket from "../protocol/WorldPacket";
import Loop from "./utils/Loop";
import WorldServerConfig from "./WorldServerConfig";
import { Opcode } from "../protocol/Opcode";
import WorldServer from "./WorldServer";
import { WorldSessionStatus } from "./WorldSessionStatus";
import Codec from "../protocol/Codec";
import WorldSessionState from "./WorldSessionState";

export default class WorldSession {

    public socket: WorldSocket;
    public readonly server: WorldServer;
    private readonly config: WorldServerConfig;

    public readonly state: WorldSessionState;

    public status: null | WorldSessionStatus;
    public latency: number;

    private readonly recvQueue: WorldPacket[];

    private updateLoop?: Loop;

    constructor(socket: WorldSocket) {
        this.socket = socket;
        this.server = socket.server;
        this.config = this.server.config;

        this.state = new WorldSessionState(this);

        this.status = WorldSessionStatus.STATUS_AUTHED;
        this.latency = -1;

        this.recvQueue = [];

        this.resetUpdateLoop(this.config.serverUpdateRate);
    }

    public queuePacket(packet: WorldPacket): void {
        this.recvQueue.push(packet);
    }

    public sendObject<T>(opcode: Opcode, object: T) {
        this.sendPacket(Codec.encode(opcode, object));
    }

    public sendPacket(packet: WorldPacket): void {
        this.socket!.sendPacket(packet, false);
    }

    public handleQueuedPackets(delta: number): void {
        this.recvQueue.forEach(packet => {
            const opcode = packet[0] as Opcode;

            const handler = this.socket.opcodeTable.getHandler(opcode);

            handler.handle(this, packet, delta);
        });
        this.recvQueue.length = 0;
    }

    public resetUpdateLoop(tickrate: number) {
        tickrate = this.calcTickrate(tickrate);

        if (this.updateLoop?.tickrate != tickrate) {
            this.updateLoop?.stop();

            this.updateLoop = new Loop();
            this.updateLoop.start(delta => this.sendUpdate(delta), tickrate);
        }
    }

    public destroy() {
        this.state.destroy();

        this.updateLoop?.stop();

        this.recvQueue.length = 0;
        this.status = null;
    }

    private sendUpdate(delta: number): void {
        this.server.world.collectSessionUpdate(this, delta);

        this.socket!.sendBufferedPackets();
    }

    private calcTickrate(tickrate: number) {
        if (tickrate == -1) {
            return (this.config.serverUpdateRate < 0 || this.config.serverUpdateRate > this.config.simulationRate) ? this.config.simulationRate : this.config.serverUpdateRate
        } else {
            return tickrate;
        }
    }
}
