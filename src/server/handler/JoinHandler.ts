import WorldSession from "../WorldSession";
import { ObjectHandler } from "../WorldPacketHandler";
import Join from "../../entity/Join";
import { Opcode } from "../../protocol/Opcode";
import Player from "../core/Player";
import ModelComponent from "../core/ModelComponent";
import { WorldSessionStatus } from "../WorldSessionStatus";

export default class JoinHandler extends ObjectHandler<Join> {

    public handleObject(session: WorldSession, join: Join): void {
      const guid = this.world.objects.guid();

      const player = new Player(this.world, guid);

      player.getComponent(ModelComponent).setModel(join.model);

      player.x = Math.random() * 300 + 100;
      player.y = 150;

      session.scope.player = player;
      session.status = WorldSessionStatus.STATUS_JOINED;

      session.sendPacket([Opcode.MSG_JOIN, guid]);

      this.world.objects.add(player);
    }
}
