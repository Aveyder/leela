import WorldSession from "../WorldSession";
import { ObjectHandler } from "../WorldPacketHandler";
import GameObjectState from "../../entity/GameObjectState";

export default class GameObjectHandler extends ObjectHandler<GameObjectState> {

    public handleObject(session: WorldSession, gameObject: GameObjectState): void {
        session.scope.handlePlayerCreation(gameObject);
    }
}
