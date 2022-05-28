import {createMessage, Data, Message, Opcode, Packet, SerdeSystem} from "@leela/common";
import {Socket} from "socket.io-client";
import Ticks from "./Ticks";
import {CLIENT_CMD_LOOP} from "../constants/config";

export default class OutgoingSystem {

    private readonly messages: Message[];

    constructor(
        private readonly socket: Socket,
        private readonly ticks: Ticks,
        private readonly serde: SerdeSystem
    ) {
        this.messages = [];
    }

    public push(opcode: Opcode, data?: Data): void {
        const serializedData = this.serde.serialize(opcode, data);

        const message = createMessage(opcode, serializedData);

        this.messages.push(message);

        if (!CLIENT_CMD_LOOP) this.send();
    }

    public send(): void {
        if (this.socket.connected && this.messages.length > 0) {
            const clientPacket = [Date.now(), this.ticks.client, this.ticks.server.tick, ...this.messages] as Packet;

            this.messages.length = 0;

            const json = JSON.stringify(clientPacket);

            this.socket.send(json);
        }
    }
}
