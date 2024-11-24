import WorldSession from "../WorldSession";
import { ObjectHandler } from "../WorldPacketHandler";
import { GameObjectState } from "../../entity/GameObjectState";

export default class GameObjectHandler extends ObjectHandler<GameObjectState> {

    public handleObject(session: WorldSession, state: GameObjectState): void {
        if (state.gameObject.guid === session.scope.playerGuid) return;

        this.scene.spawn.gameObject(state);
    }
}
