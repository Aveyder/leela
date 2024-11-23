import WorldSession from "../WorldSession";
import { ObjectHandler } from "../WorldPacketHandler";
import Join from "../../entity/Join";
import { Opcode } from "../../protocol/Opcode";
import Player from "../core/Player";
import ModelComponent from "../core/ModelComponent";
import Move from "../../entity/Move";
import MovementComponent from "../../core/MovementComponent";

export default class MoveHandler extends ObjectHandler<Move> {

    public handleObject(session: WorldSession, move: Move): void {
      const player = session.state.player!;

      const movement = player.getComponent(MovementComponent);
      movement.dx = move.dir.x;
      movement.dy = move.dir.y;
    }
}
