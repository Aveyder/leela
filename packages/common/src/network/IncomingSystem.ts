import EventEmitter from "eventemitter3";
import {Data, Message, Packet} from "./types";
import {OPCODE_EVENT_PREFIX} from "../constants/events";
import {Opcode} from "./opcodes";

export default class IncomingSystem {

    private readonly events: EventEmitter;

    constructor() {
        this.events = new EventEmitter();
    }

    public on(code: Opcode | string, callback: (data: Data) => void, context?: never): void {
        if (Number.isInteger(code)) {
            code = IncomingSystem.opcodeEvent(code as Opcode);
        }
        this.events.on(code as string, callback, context);
    }

    public receive(input: string): void {
        if (input.startsWith('[')) {
            const packet = JSON.parse(input) as Packet;

            this.receivePacket(packet);
        } else {
            this.receiveUTF8(input);
        }
    }

    private receiveUTF8(code: string): void {
        this.events.emit(code);
    }

    public receivePacket(packet: Packet): void {
        packet.forEach(message => this.receiveMessage(message));
    }

    private receiveMessage(message: Message): void {
        const opcode = message.shift() as Opcode;

        this.events.emit(IncomingSystem.opcodeEvent(opcode), message as Data);
    }

    private static opcodeEvent(opcode: Opcode): string {
        return `${OPCODE_EVENT_PREFIX}_${opcode}`;
    }
}
