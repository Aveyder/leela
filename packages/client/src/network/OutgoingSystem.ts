import {Opcode} from "@leela/common/src/network/opcodes";
import {Data, Message} from "@leela/common/src/network/types";
import {Socket} from "socket.io-client";

export default class OutgoingSystem {

    constructor(
        private readonly socket: Socket
    ) {}

    public send(opcode: Opcode, data?: Data): void {
        if (this.socket.connected) {
            const message = (data ? [opcode, ...data] : [opcode]) as Message;

            const json = JSON.stringify(message);

            this.socket.send(json);
        }
    }
}
