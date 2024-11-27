import { ObjectHandler } from "../WorldPacketHandler";
import { GameObjectState } from "../../entity/GameObjectState";

export default class GameObjectHandler extends ObjectHandler<GameObjectState> {
    public handleObject(state: GameObjectState): void {
        if (state.gameObject.guid === this.session.scope.playerGuid) return;

        this.scope.spawn.gameObject(state);
    }
}
