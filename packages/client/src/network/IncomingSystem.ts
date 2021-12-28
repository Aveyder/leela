import {AckTick, Message, MessageSystem, ServerPacket, Tick, Timestamp} from "@leela/common";
import Ticks from "./Ticks";

export default class IncomingSystem {

    constructor(
        private readonly ticks: Ticks,
        private readonly messages: MessageSystem
    ) {
    }

    public receive(input: string): void {
        if (input.startsWith("[")) {
            this.receivePacket(input);
        } else {
            this.messages.receiveUTF8(input);
        }
    }

    private receivePacket(input: string) {
        const packet = JSON.parse(input) as ServerPacket;

        const timestamp = packet.shift() as Timestamp;

        const ticks = this.ticks;
        if (ticks.server.time < timestamp) {
            ticks.server.time = timestamp;
            ticks.server.tick = packet.shift() as Tick;
            ticks.server.ack = packet.shift() as AckTick;

            this.messages.receiveMessages(packet as Message[]);
        }
    }
}
