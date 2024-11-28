import { ObjectHandler } from "../WorldPacketHandler";
import { GameObjectNew } from "../../entity/GameObjectNew";

export default class GameObjectNewHandler extends ObjectHandler<GameObjectNew> {
  public handleObject(gameObjectNew: GameObjectNew): void {
    this.scope.resolveTimestamp(gameObjectNew);

    const state = gameObjectNew.state;

    if (!this.scope.isPlayer(state)) {
      this.scope.spawn.gameObject(gameObjectNew.timestamp, state);
    }
  }
}
