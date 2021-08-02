import {ClientPacket, createMessage, Data, Message, Opcode} from "@leela/common";
import {Socket} from "socket.io-client";
import Ticks from "./Ticks";

export default class OutgoingSystem {

    private readonly messages: Message[];

    constructor(
        private readonly ticks: Ticks,
        private readonly socket: Socket
    ) {
        this.messages = [];
    }

    public push(opcode: Opcode, data?: Data): void {
        const message = createMessage(opcode, data);

        this.messages.push(message);
    }

    public send(): void {
        if (this.socket.connected && this.messages.length > 0) {
            const tick = this.ticks.client;
            const clientPacket = [Date.now(), tick, ...this.messages] as ClientPacket;

            this.messages.length = 0;

            const json = JSON.stringify(clientPacket);

            this.socket.send(json);
        }
    }
}
