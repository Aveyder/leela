import WorldSession from "../WorldSession";
import { ObjectHandler } from "../WorldPacketHandler";
import EnvInit from "../../entity/EnvInit";
import Player from "../core/Player";
import { ComponentId } from "../../protocol/ComponentId";
import { ModelDescriptor } from "../../resource/Model";
import ModelComponent from "../core/ModelComponent";
import GameObjectState from "../../entity/GameObjectState";

export default class EnvInitHandler extends ObjectHandler<EnvInit> {

    public handleObject(session: WorldSession, envInit: EnvInit): void {
        for (let gameObject of envInit.gameObjects) {
            if (gameObject.guid === session.scope.playerGuid) {
                this.createPlayer(session, gameObject);
            }
        }
    }

    private createPlayer(session: WorldSession, gameObject: GameObjectState): void {
        const player = new Player(this.scene, session, gameObject.guid);

        const model = gameObject.components[ComponentId.MODEL] as ModelDescriptor;
        player.getComponent(ModelComponent).setModel(model);

        player.x = gameObject.x;
        player.y = gameObject.y;

        this.scene.objects.add(player);

        session.scope.player = player;
    }
}
