import {Opcode, SIMULATION_RATE, SNAPSHOT_RATE, WorldPacket} from "@leela/common";
import OpcodeTable from "./protocol/OpcodeTable";
import WorldSocket from "./WorldSocket";
import Player from "../entities/Player";
import {handlePlayerLogout, handlePlayerUpdate} from "../handlers/playerHandler";
import Loop from "../Loop";

export default class WorldSession {

    private readonly worldSocket: WorldSocket;
    private readonly opcodeTable: OpcodeTable;

    private readonly recvQueue: WorldPacket[];

    private loop: Loop;

    public player: Player;

    public latency: number;

    constructor(worldSocket: WorldSocket) {
        this.worldSocket = worldSocket;
        this.opcodeTable = worldSocket.opcodeTable;

        this.recvQueue = [];
    }

    public init() {
        this.updateLoop(SNAPSHOT_RATE);
    }

    public get id() {
        return this.worldSocket.socket.id;
    }

    public get world() {
        return this.worldSocket.world;
    }

    public queuePacket(worldPacket: WorldPacket): void {
        this.recvQueue.push(worldPacket);
    }

    public sendPacket(worldPacket: WorldPacket): void {
        this.worldSocket.sendPacket(worldPacket);
    }

    public update(delta: number): void {
        this.recvQueue.forEach(worldPacket => {
            // validate packet
            const opcode = worldPacket[0] as Opcode;

            const handler = this.opcodeTable.get(opcode);

            handler(this, worldPacket, delta);
        });
        this.recvQueue.length = 0;
    }

    public destroy() {
        this.loop?.stop();

        handlePlayerLogout(this);
    }

    public updatePlayer() {
        handlePlayerUpdate(this);

        this.worldSocket.update();
    }

    public updateLoop(tickrate: number) {
        tickrate = calcTickrate(tickrate);

        if (this.loop?.tickrate != tickrate) {
            this.loop?.stop();

            this.loop = new Loop();
            this.loop.start(() => this.updatePlayer(), tickrate);
        }
    }
}

function calcTickrate(tickrate: number) {
    if (tickrate == -1) {
        return (SNAPSHOT_RATE < 0 || SNAPSHOT_RATE > SIMULATION_RATE) ? SIMULATION_RATE : SNAPSHOT_RATE
    } else {
        return tickrate;
    }
}