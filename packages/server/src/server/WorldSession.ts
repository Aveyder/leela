import {Opcode, SIMULATION_RATE, WorldPacket} from "@leela/common";
import OpcodeTable from "./protocol/OpcodeTable";
import WorldSocket from "./WorldSocket";
import Player, {sendUpdateToPlayer} from "../entities/Player";
import Loop from "../Loop";
import {UPDATE_RATE} from "../config";
import {deleteUnitFromWorld} from "../entities/Unit";

export default class WorldSession {

    private readonly worldSocket: WorldSocket;

    private readonly recvQueue: WorldPacket[];

    private updateLoop: Loop;

    public player: Player;

    public latency: number;

    constructor(worldSocket: WorldSocket) {
        this.worldSocket = worldSocket;

        this.recvQueue = [];
    }

    public init() {
        this.resetUpdateLoop(UPDATE_RATE);
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
        this.worldSocket.sendPacket(worldPacket, false);
    }

    public update(delta: number): void {
        this.recvQueue.forEach(worldPacket => {
            const opcode = worldPacket[0] as Opcode;

            const handler = OpcodeTable.INSTANCE.get(opcode);

            handler(this, worldPacket, delta);
        });
        this.recvQueue.length = 0;
    }

    public resetUpdateLoop(tickrate: number) {
        tickrate = calcTickrate(tickrate);

        if (this.updateLoop?.tickrate != tickrate) {
            this.updateLoop?.stop();

            this.updateLoop = new Loop();
            this.updateLoop.start(delta => this.sendUpdateToPlayer(), tickrate);
        }
    }

    public destroy() {
        this.updateLoop?.stop();

        if (this.player) deleteUnitFromWorld(this.player);
    }

    private sendUpdateToPlayer() {
        sendUpdateToPlayer(this);

        this.worldSocket.update();
    }
}

function calcTickrate(tickrate: number) {
    if (tickrate == -1) {
        return (UPDATE_RATE < 0 || UPDATE_RATE > SIMULATION_RATE) ? SIMULATION_RATE : UPDATE_RATE
    } else {
        return tickrate;
    }
}