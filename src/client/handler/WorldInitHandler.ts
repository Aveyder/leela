import WorldSession from "../WorldSession";
import { ObjectHandler } from "../WorldPacketHandler";
import { WorldState } from "../../entity/WorldState";

export default class WorldInitHandler extends ObjectHandler<WorldState> {

    public handleObject(session: WorldSession, envInit: WorldState): void {
        for (let gameObject of envInit.gameObjects.values()) {
            this.scene.spawn.gameObject(gameObject);
        }
    }
}
