import WorldSession from "../WorldSession";
import { ObjectHandler } from "../WorldPacketHandler";
import EnvInit from "../../entity/EnvInit";

export default class EnvInitHandler extends ObjectHandler<EnvInit> {

    public handleObject(session: WorldSession, envInit: EnvInit): void {
        for (let gameObject of envInit.gameObjects) {
            session.scope.handlePlayerCreation(gameObject)
        }
    }
}
