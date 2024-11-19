import WorldSocket from "./WorldSocket";
import WorldPacket from "../protocol/WorldPacket";
import Loop from "./utils/Loop";
import WorldServerConfig from "./WorldServerConfig";
import OpcodeTable from "./OpcodeTable";
import { Opcode } from "../protocol/Opcode";
import WorldServer from "./WorldServer";
import { WorldSessionStatus } from "./WorldSessionStatus";


export default class WorldSession {

    public socket: WorldSocket;
    public readonly server: WorldServer;
    private readonly config: WorldServerConfig;

    public status: null | WorldSessionStatus;
    public latency: number;

    private readonly recvQueue: WorldPacket[];

    private updateLoop?: Loop;

    constructor(socket: WorldSocket) {
        this.socket = socket;
        this.server = socket.server;
        this.config = this.server.config;
        this.status = WorldSessionStatus.STATUS_AUTHED;
        this.latency = -1;
        this.recvQueue = [];

        this.resetUpdateLoop(this.config.serverUpdateRate);
    }

    public queuePacket(worldPacket: WorldPacket): void {
        this.recvQueue.push(worldPacket);
    }

    public sendPacket(worldPacket: WorldPacket): void {
        this.socket!.sendPacket(worldPacket, false);
    }

    public update(delta: number): void {
        this.recvQueue.forEach(worldPacket => {
            const opcode = worldPacket[0] as Opcode;

            const handler = OpcodeTable.getHandler(opcode);

            handler(this, worldPacket, delta);
        });
        this.recvQueue.length = 0;
    }

    public resetUpdateLoop(tickrate: number) {
        tickrate = this.calcTickrate(tickrate);

        if (this.updateLoop?.tickrate != tickrate) {
            this.updateLoop?.stop();

            this.updateLoop = new Loop();
            this.updateLoop.start(delta => this.sendUpdate(), tickrate);
        }
    }

    public destroy() {
        this.updateLoop?.stop();

        this.recvQueue.length = 0;
        this.status = null;
    }

    private sendUpdate() {
        // collect update

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
