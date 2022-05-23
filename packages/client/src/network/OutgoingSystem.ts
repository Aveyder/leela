import {ClientPacket, createMessage, Data, Message, Opcode} from "@leela/common";
import {Socket} from "socket.io-client";
import Ticks from "./Ticks";
import {CLIENT_CMD_LOOP} from "../constants/config";

export default class OutgoingSystem {

    private readonly messages: Message[];

    constructor(
        private readonly socket: Socket,
        private readonly ticks: Ticks
    ) {
        this.messages = [];
    }

    public push(opcode: Opcode, data?: Data): void {
        const message = createMessage(opcode, data);

        this.messages.push(message);

        if (!CLIENT_CMD_LOOP) this.send();
    }

    public send(): void {
        if (this.socket.connected && this.messages.length > 0) {
            const clientPacket = [Date.now(), this.ticks.client, this.ticks.server.tick, ...this.messages] as ClientPacket;

            this.messages.length = 0;

            const json = JSON.stringify(clientPacket);

            this.socket.send(json);
        }
    }
}
