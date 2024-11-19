import WorldPacketHandler from "./WorldPacketHandler";
import { Opcode } from "../protocol/Opcode";
import { handlePong } from "./pong";

export default class OpcodeTable {

  private static readonly TABLE: WorldPacketHandler[] = [];

  static {
    this.TABLE[Opcode.SMSG_PONG] = handlePong;
    this.TABLE[Opcode.MSG_JOIN] = (): void => {};
  }

  public static getHandler(opcode: Opcode): WorldPacketHandler {
    return this.TABLE[opcode];
  }
}
