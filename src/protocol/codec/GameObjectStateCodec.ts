import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import GameObject from "../../core/GameObject";
import { ComponentSegment } from "./ComponentSegment";
import ComponentSpecCodec from "./ComponentSpecCodec";
import { toFixed } from "../../utils/math";
import { DeltaGameObjectState, GameObjectState } from "../../entity/GameObjectState";

export class GameObjectStateCodec implements SymmetricCodec<GameObjectState> {

  public static readonly INSTANCE: GameObjectStateCodec = new GameObjectStateCodec();

  map(gameObject: GameObject): GameObjectState {
    return {
      guid: gameObject.guid,
      x: gameObject.x,
      y: gameObject.y,
      isStatic: gameObject.isStatic,
      visible: gameObject.visible,
      active: gameObject.active,
      components: ComponentSpecCodec.INSTANCE.map(gameObject.getComponents())
    };
  }
  encode(state: GameObjectState): WorldPacketData {
    return [
      state.guid,
      toFixed(state.x, 1),
      toFixed(state.y, 1),
      state.isStatic,
      state.visible,
      state.active,
      ...ComponentSpecCodec.INSTANCE.encode(state.components)
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
      components: ComponentSpecCodec.INSTANCE.decode(componentSegments)
    };
  }
}

export class DeltaGameObjectStateCodec implements SymmetricCodec<DeltaGameObjectState> {

  public static readonly INSTANCE: DeltaGameObjectStateCodec = new DeltaGameObjectStateCodec();

  delta(gameObjectA: GameObjectState, gameObjectB: GameObjectState): DeltaGameObjectState {
    return {} as DeltaGameObjectState;
  }
  encode(state: DeltaGameObjectState): WorldPacketData {
    return [];
  }
  decode(state: WorldPacketData): DeltaGameObjectState {
    return {} as DeltaGameObjectState;
  }
}
