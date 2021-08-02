import {AckTick, IncomingSystem, Message, ServerPacket, Tick, Timestamp} from "@leela/common";
import {Socket} from "socket.io-client";
import Ticks from "./Ticks";

export default class ConnectionSystem {

    constructor(
        private readonly socket: Socket,
        private readonly ticks: Ticks,
        private readonly incoming: IncomingSystem
    ) {
    }

    public init(): void {
        this.socket.on("message", (input: string) => {
            if (input.startsWith("[")) {
                this.receivePacket(input);
            } else {
                this.incoming.receiveUTF8(input);
            }
        });
    }

    private receivePacket(input: string) {
        const packet = JSON.parse(input) as ServerPacket;

        const timestamp = packet.shift() as Timestamp;

        const ticks = this.ticks;
        if (ticks.server.timestamp < timestamp) {
            ticks.server.timestamp = timestamp;
            ticks.server.tick = packet.shift() as Tick;
            ticks.clientAck = packet.shift() as AckTick;

            this.incoming.receiveMessages(packet as Message[]);
        }
    }
}
