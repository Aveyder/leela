import WorldSession from "../WorldSession";
import { ObjectHandler } from "../WorldPacketHandler";
import Join from "../../entity/Join";
import { Opcode } from "../../protocol/Opcode";

export default class JoinHandler extends ObjectHandler<Join> {

    public handleObject(session: WorldSession, join: Join): void {
      console.log(`join request`);
      const player = this.world.createObject();

      session.sendPacket([Opcode.MSG_JOIN, player.guid]);
    }
}
