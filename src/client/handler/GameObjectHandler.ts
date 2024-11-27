import { ObjectHandler } from "../WorldPacketHandler";
import { GameObjectState } from "../../entity/GameObjectState";

export default class GameObjectHandler extends ObjectHandler<GameObjectState> {
  public handleObject(state: GameObjectState): void {
    if (!this.scope.isPlayer(state)) {
      this.scope.spawn.gameObject(state);
    }
  }
}
