import WorldPacketHandler, { worldPacketHandler } from "./WorldPacketHandler";
import { Opcode } from "../protocol/Opcode";
import { WorldSessionStatus } from "./WorldSessionStatus";
import { handleUpdateRateChange } from "./updateRate";
import WorldSession from "./WorldSession";
import { Vec2 } from "../utils/math";

export default class OpcodeTable {

  private static readonly TABLE: [WorldSessionStatus, WorldPacketHandler][] = [];

  static {
    this.TABLE[Opcode.CMSG_UPDATE_RATE] = [WorldSessionStatus.STATUS_AUTHED, handleUpdateRateChange];
    this.TABLE[Opcode.CMSG_MOVE] = [WorldSessionStatus.STATUS_AUTHED, worldPacketHandler<Vec2>((session: WorldSession, object: Vec2) => {
      console.log(`move x: ${object.x}, y: ${object.y}`);
    })];
  }

  public static getWorldSessionStatus(opcode: Opcode): WorldSessionStatus {
    return this.TABLE[opcode][0];
  }

  public static getHandler(opcode: Opcode): WorldPacketHandler {
    return this.TABLE[opcode][1];
  }
}
