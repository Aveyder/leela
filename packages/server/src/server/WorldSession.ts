import {Opcode, SIMULATION_RATE, WorldPacket} from "@leela/common";
import OpcodeTable from "./protocol/OpcodeTable";
import WorldSocket from "./WorldSocket";
import Player from "../player/Player";
import Loop from "../utils/Loop";
import {UPDATE_RATE} from "../config";
import {sendUpdateToPlayer} from "../core/update";
import GameObject, {deleteObjectFromWorld} from "../core/GameObject";

export default class WorldSession {

    private worldSocket: WorldSocket;
    private readonly recvQueue: WorldPacket[];
    public readonly lastSentUpdate: Record<number, GameObject>;

    private updateLoop: Loop;

    public player: Player;

    public latency: number;

    constructor(worldSocket: WorldSocket) {
        this.worldSocket = worldSocket;
        this.recvQueue = [];
        this.lastSentUpdate = {};
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

        if (this.player) deleteObjectFromWorld(this.player);

        this.worldSocket = null;
        this.recvQueue.length = 0;
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