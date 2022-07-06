import {Opcode, SIMULATION_RATE, WorldPacket} from "@leela/common";
import OpcodeTable from "./protocol/OpcodeTable";
import WorldSocket from "./WorldSocket";
import {CLIENT_CMD_LOOP, CLIENT_CMD_RATE, CLIENT_UPDATE_RATE, PING_INTERVAL_MS} from "../config";
import Loop from "../Loop";
import Unit from "../core/Unit";

export default class WorldSession {

    private _worldSocket: WorldSocket;

    private cmpLoop: Loop;

    private _pingStart: number;
    private pingInterval: number;
    public latency: number;

    public playerGuid: number;
    public player: Unit;

    constructor(worldSocket: WorldSocket) {
        this._worldSocket = worldSocket;

        this.latency = -1;
    }

    public init(): void {
        this.sendPacket([Opcode.CMSG_UPDATE_RATE, CLIENT_UPDATE_RATE]);
        this.initCmdLoop();
        this.startPing();
    }

    public sendPacket(worldPacket: WorldPacket): void {
        this._worldSocket.sendPacket(worldPacket, !CLIENT_CMD_LOOP);
    }

    public recvPacket(worldPacket: WorldPacket): void {
        const opcode = worldPacket[0] as Opcode;

        const handler = OpcodeTable.INSTANCE.get(opcode);

        handler(this, worldPacket);
    }

    private initCmdLoop() {
        this.cmpLoop = new Loop();

        this.cmpLoop.start(
            () => this._worldSocket.update(),
            CLIENT_CMD_RATE < 0 ? SIMULATION_RATE : CLIENT_CMD_RATE
        );
    }

    private startPing() {
        this.pingInterval = setInterval(() => {
            this._pingStart = Date.now();

            this._worldSocket.sendPacket([Opcode.CMSG_PING, this.latency], true);
        }, PING_INTERVAL_MS) as unknown as number;
    }

    public destroy(): void {
        this._worldSocket = null;

        this.cmpLoop.stop();

        clearInterval(this.pingInterval);
        this._pingStart = null;
        this.latency = -1;

        this.playerGuid = null;
        this.player = null;
    }

    public get worldScene() {
        return this._worldSocket.worldScene;
    }

    public get worldSocket() {
        return this._worldSocket;
    }

    public get pingStart() {
        return this._pingStart;
    }
}
