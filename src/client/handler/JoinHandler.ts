import WorldSession from "../WorldSession";
import WorldPacketHandler from "../WorldPacketHandler";
import WorldPacket from "../../protocol/WorldPacket";
import SpriteComponent from "../core/SpriteComponent";
import ModelComponent from "../core/ModelComponent";
import MovementComponent from "../core/MovementComponent";
import { MODELS } from "../../resource/Model";
import ControlComponent from "../core/ControlComponent";

export default class JoinHandler extends WorldPacketHandler {

    public handle(session: WorldSession, packet: WorldPacket): void {
        const guid = packet[1] as number;

        const player = this.scene.createObject(guid);

        const spriteComponent = new SpriteComponent();
        const modelComponent = new ModelComponent();

        player.addComponent(spriteComponent);
        player.addComponent(modelComponent);
        player.addComponent(new MovementComponent());
        player.addComponent(new ControlComponent());

        modelComponent.setModel(MODELS[0]);

        const sprite = spriteComponent.sprite;
        sprite.setPosition(100, 100);

        session.state.player = player;
    }
}
