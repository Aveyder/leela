import { ObjectHandler } from "../WorldPacketHandler";
import Move from "../../entity/Move";
import MovementComponent from "../core/MovementComponent";

export default class MoveHandler extends ObjectHandler<Move> {

    public handleObject(move: Move): void {
      const player = this.scope.player!;

      const movement = player.getComponent(MovementComponent);

      movement.move(move.dir);
    }
}
