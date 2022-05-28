import EventEmitter from "eventemitter3";
import {ClientId, Data, Message} from "./types";
import {OPCODE_EVENT_PREFIX} from "../constants/events";
import {Opcode} from "./opcodes";
import SerdeSystem from "./SerdeSystem";

export default class MessageSystem {

    private readonly events: EventEmitter;

    constructor(private readonly serde: SerdeSystem) {
        this.events = new EventEmitter();
    }

    public on(code: Opcode | string, callback: (data: Data, id?: ClientId) => void, context?: unknown): void {
        if (Number.isInteger(code)) {
            code = MessageSystem.opcodeEvent(code as Opcode);
        }
        this.events.on(code as string, callback, context);
    }

    public receiveUTF8(code: string): void {
        this.events.emit(code);
    }

    public receiveMessages(messages: Message[], id?: ClientId): void {
        messages.forEach(message => this.receiveMessage(message, id));
    }

    private receiveMessage(message: Message, id?: ClientId): void {
        const opcode = message.shift() as Opcode;

        const deserializedData = this.serde.deserialize(opcode, message.shift() as Data);

        this.events.emit(MessageSystem.opcodeEvent(opcode), deserializedData, id);
    }

    private static opcodeEvent(opcode: Opcode): string {
        return `${OPCODE_EVENT_PREFIX}_${opcode}`;
    }
}
