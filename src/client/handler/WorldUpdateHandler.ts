import WorldSession from "../WorldSession";
import { ObjectHandler } from "../WorldPacketHandler";
import { DeltaWorldState } from "../../entity/WorldState";

export default class WorldUpdateHandler extends ObjectHandler<DeltaWorldState> {

    public handleObject(session: WorldSession, deltaWorldState: DeltaWorldState): void {
        for (const guid of deltaWorldState.gameObjects.keys()) {
            const deltaGameObjectState = deltaWorldState.gameObjects.get(guid)!;

            const gameObject = this.scene.objects.gameObjects.get(guid)!;

            // const debug = gameObject.getComponent(DebugComponent);
            // if (deltaGameObjectState.gameObject.x !== undefined) {
            //     debug.x = deltaGameObjectState.gameObject.x;
            // }
            // if (deltaGameObjectState.gameObject.y !== undefined) {
            //     debug.y = deltaGameObjectState.gameObject.y;
            // }
        }
    }
}
