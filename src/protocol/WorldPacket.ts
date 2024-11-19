import { Opcode } from "./Opcode";

export type WorldPacketData = unknown[];
type WorldPacket = [Opcode, ...WorldPacketData];

export default WorldPacket;
