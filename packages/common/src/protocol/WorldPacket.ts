import {Opcode} from "./opcodes";

type WorldPacket = [Opcode, ...unknown[]];

export default WorldPacket;
