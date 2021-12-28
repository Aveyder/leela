import {Opcode} from "./opcodes";

type ClientId = string;

type Data = unknown[];
type Message = [Opcode, ...Data];

type Timestamp = number;
type Tick = number;
type AckTick = Tick;

type ClientPacket = [Timestamp, Tick, AckTick, ...Message[]];
type ServerPacket = [Timestamp, Tick, AckTick, ...Message[]];

export {
    ClientId,
    Data,
    Message,
    Timestamp,
    Tick,
    AckTick,
    ClientPacket,
    ServerPacket
};
