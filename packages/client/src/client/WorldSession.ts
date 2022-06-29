import {Opcode, SIMULATION_RATE, WorldPacket} from "@leela/common";
import OpcodeTable from "./protocol/OpcodeTable";
import WorldSocket from "./WorldSocket";
import {CLIENT_CMD_LOOP, CLIENT_CMD_RATE, CLIENT_UPDATE_RATE, PING_INTERVAL_MS} from "../config";
import Loop from "../Loop";
import Unit from "../entities/Unit";

export default class WorldSession {

    private readonly worldSocket: WorldSocket;

    private cmpLoop: Loop;

    private _pingStart: number;
    private pingInterval: number;
    public latency: number;

    public playerGuid: number;
    public player: Unit;

    constructor(worldSocket: WorldSocket) {
        this.worldSocket = worldSocket;

        this.latency = -1;
    }

    public init(): void {
        this.sendPacket([Opcode.CMSG_UPDATE_RATE, CLIENT_UPDATE_RATE]);
        this.initCmdLoop();
        this.startPing();
    }

    public sendPacket(worldPacket: WorldPacket): void {
        this.worldSocket.sendPacket(worldPacket, !CLIENT_CMD_LOOP);
    }

    public recvPacket(worldPacket: WorldPacket): void {
        const opcode = worldPacket[0] as Opcode;

        const handler = OpcodeTable.INSTANCE.get(opcode);

        handler(this, worldPacket);
    }

    private initCmdLoop() {
        this.cmpLoop = new Loop();

        this.cmpLoop.start(
            () => this.worldSocket.update(),
            CLIENT_CMD_RATE < 0 ? SIMULATION_RATE : CLIENT_CMD_RATE
        );
    }

    private startPing() {
        this.pingInterval = setInterval(() => {
            this._pingStart = Date.now();

            this.worldSocket.sendPacket([Opcode.CMSG_PING, this.latency], true);
        }, PING_INTERVAL_MS) as unknown as number;
    }

    public destroy(): void {
        this.cmpLoop.stop();

        clearInterval(this.pingInterval);
        this._pingStart = null;
        this.latency = -1;

        this.playerGuid = null;
        this.player = null;
    }

    public get worldScene() {
        return this.worldSocket.worldScene;
    }

    public get pingStart() {
        return this._pingStart;
    }
}
