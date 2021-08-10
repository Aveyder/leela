import {Opcode} from "./opcodes";
import {Data, Message} from "./types";

function createMessage(opcode: Opcode, data?: Data): Message {
    return (data ? [opcode, ...data] : [opcode]) as Message;
}

export {
    createMessage
}
