import {Opcode, SIMULATION_RATE, WorldPacket} from "@leela/common";
import OpcodeTable from "./protocol/OpcodeTable";
import WorldSocket from "./WorldSocket";
import {CLIENT_CMD_LOOP, CLIENT_CMD_RATE, CLIENT_UPDATE_RATE, PING_DELAY_MS} from "../config";
import TimeStepLoop from "../TimeStepLoop";
import Unit from "../entities/Unit";

export default class WorldSession {

    private readonly worldSocket: WorldSocket;
    private readonly opcodeTable: OpcodeTable;

    private loop: TimeStepLoop;

    private _pingStart: number;
    private pingInterval: number;
    public latency: number;

    public playerGuid: number;
    public player: Unit;

    constructor(worldSocket: WorldSocket) {
        this.worldSocket = worldSocket;
        this.opcodeTable = worldSocket.opcodeTable;

        this.latency = -1;
    }

    public init(): void {
        this.sendPacket([Opcode.CMSG_UPDATE_RATE, CLIENT_UPDATE_RATE]);
        this.cmdLoop();
        this.startPing();
    }

    public get worldScene() {
        return this.worldSocket.worldScene;
    }

    public recvPacket(worldPacket: WorldPacket): void {
        const opcode = worldPacket[0] as Opcode;

        const handler = this.opcodeTable.get(opcode);

        handler(this, worldPacket);
    }

    public sendPacket(worldPacket: WorldPacket): void {
        this.worldSocket.sendPacket(worldPacket);
    }

    public destroy(): void {
        this.loop?.stop();

        clearInterval(this.pingInterval);
    }

    private cmdLoop() {
        if (CLIENT_CMD_LOOP) {
            this.loop = new TimeStepLoop();

            this.loop.start(
                () => this.worldSocket.update(),
                CLIENT_CMD_RATE < 0 ? SIMULATION_RATE : CLIENT_CMD_RATE
            );
        }
    }

    private startPing() {
        this.pingInterval = setInterval(() => {
            this._pingStart = Date.now();

            this.worldSocket.sendPacket([Opcode.CMSG_PING, this.latency], true);
        }, PING_DELAY_MS) as unknown as number;
    }

    public get pingStart() {
        return this._pingStart;
    }
}
