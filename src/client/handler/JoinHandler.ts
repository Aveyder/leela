import WorldSession from "../WorldSession";
import WorldPacketHandler from "../WorldPacketHandler";
import WorldPacket from "../../protocol/WorldPacket";
import ModelComponent from "../core/ModelComponent";
import { Model } from "../../resource/Model";
import Player from "../core/Player";

export default class JoinHandler extends WorldPacketHandler {

    public handle(session: WorldSession, packet: WorldPacket): void {
        const guid = packet[1] as number;

        const player = new Player(this.scene, session, guid);

        player.getComponent(ModelComponent).setModel(Model.UNIT_5);

        player.x = 100;
        player.y = 100;

        this.scene.objects.add(player);

        session.state.player = player;
    }
}
