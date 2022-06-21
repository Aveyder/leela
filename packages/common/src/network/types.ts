import {Opcode} from "../protocol/opcodes";

type ClientId = string;

type Data = unknown | unknown[];
type Message = [Opcode, Data];

type Timestamp = number;
type Tick = number;
type AckTick = Tick;

type Packet = [Timestamp, Tick, AckTick, ...Message[]];

export {
    ClientId,
    Data,
    Message,
    Timestamp,
    Tick,
    AckTick,
    Packet
};
