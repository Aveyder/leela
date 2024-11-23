import WorldSession from "../WorldSession";
import { ObjectHandler } from "../WorldPacketHandler";
import Join from "../../entity/Join";
import { Opcode } from "../../protocol/Opcode";
import Player from "../core/Player";
import ModelComponent from "../core/ModelComponent";
import { WorldSessionStatus } from "../WorldSessionStatus";

export default class JoinHandler extends ObjectHandler<Join> {

    public handleObject(session: WorldSession, join: Join): void {
      const player = new Player(this.world);

      player.getComponent(ModelComponent).setModel(join.model);

      this.world.objects.add(player);

      session.state.player = player;
      session.status = WorldSessionStatus.STATUS_JOINED;

      session.sendPacket([Opcode.MSG_JOIN, player.guid]);
    }
}
