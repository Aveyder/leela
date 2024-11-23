import { WorldPacketData } from "../WorldPacket";
import { _Codec } from "../Codec";
import GameObjectState from "../../entity/GameObjectState";
import GameObject from "../../core/GameObject";
import { ComponentSegment } from "../ComponentSegment";
import ComponentSpecCodec from "./ComponentSpecCodec";

export default class GameObjectStateCodec implements _Codec<GameObject, GameObjectState> {

  private readonly componentSpecCodec = new ComponentSpecCodec();

  encode(gameObject: GameObject): WorldPacketData {
    return [
      gameObject.guid,
      gameObject.x,
      gameObject.y,
      gameObject.isStatic,
      gameObject.visible,
      gameObject.active,
      ...this.componentSpecCodec.encode(gameObject)
    ] as WorldPacketData;
  }
  decode(data: WorldPacketData): GameObjectState {
    const componentSegments = data.slice(6) as ComponentSegment[];

    return {
      guid: data[0] as number,
      x: data[1] as number,
      y: data[2] as number,
      isStatic: data[3] as boolean,
      visible: data[4] as boolean,
      active: data[5] as boolean,
      components: this.componentSpecCodec.decode(componentSegments)
    };
  }
}
