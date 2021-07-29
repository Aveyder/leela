import {Opcode} from "./opcodes";

type ClientId = string;

type Data = unknown[];
type Message = [Opcode, ...Data];
type Packet = Message[];

export {
    ClientId,
    Data,
    Message,
    Packet
}
