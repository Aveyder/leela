import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import GameObject from "../../core/GameObject";
import { ComponentSegment } from "./ComponentSegment";
import ComponentSpecCodec from "./ComponentSpecCodec";
import { toFixed } from "../../utils/math";
import diff from "../../utils/diff";
import { GameObjectStateDelta, GameObjectState } from "../../entity/GameObjectState";

export class GameObjectStateCodec implements SymmetricCodec<GameObjectState> {

  public static readonly INSTANCE: GameObjectStateCodec = new GameObjectStateCodec();

  map(gameObject: GameObject): GameObjectState {
    return {
      gameObject: {
        guid: gameObject.guid,
        x: gameObject.x,
        y: gameObject.y,
        isStatic: gameObject.isStatic,
        visible: gameObject.visible,
        active: gameObject.active,
      },
      components: ComponentSpecCodec.INSTANCE.map(gameObject.getComponents())
    };
  }
  encode(state: GameObjectState): WorldPacketData {
    return [
      state.gameObject.guid,
      toFixed(state.gameObject.x, 1),
      toFixed(state.gameObject.y, 1),
      state.gameObject.isStatic,
      state.gameObject.visible,
      state.gameObject.active,
      ...ComponentSpecCodec.INSTANCE.encode(state.components)
    ] as WorldPacketData;
  }
  decode(data: WorldPacketData): GameObjectState {
    const componentSegments = data.slice(6) as ComponentSegment[];

    return {
      gameObject: {
        guid: data[0] as number,
        x: data[1] as number,
        y: data[2] as number,
        isStatic: data[3] as boolean,
        visible: data[4] as boolean,
        active: data[5] as boolean,
      },
      components: ComponentSpecCodec.INSTANCE.decode(componentSegments)
    };
  }
}

export class DeltaGameObjectStateCodec implements SymmetricCodec<GameObjectStateDelta> {

  public static readonly INSTANCE: DeltaGameObjectStateCodec = new DeltaGameObjectStateCodec();

  delta(stateA: GameObjectState, stateB: GameObjectState): GameObjectStateDelta {
    const gameObjectDelta = diff(stateA.gameObject, stateB.gameObject)
    return {
      gameObject: gameObjectDelta ? gameObjectDelta : {},
      components: ComponentSpecCodec.INSTANCE.delta(stateA.components, stateB.components)
    } as GameObjectStateDelta;
  }
  encode(state: GameObjectStateDelta): WorldPacketData {
    const gameObjectData = [];

    if (state.gameObject.x !== undefined) {
      gameObjectData.push([0, toFixed(state.gameObject.x, 1)]);
    }
    if (state.gameObject.y !== undefined) {
      gameObjectData.push([1, toFixed(state.gameObject.y, 1)]);
    }
    if (state.gameObject.isStatic !== undefined) {
      gameObjectData.push([2, state.gameObject.isStatic]);
    }
    if (state.gameObject.visible !== undefined) {
      gameObjectData.push([3, state.gameObject.visible]);
    }
    if (state.gameObject.active !== undefined) {
      gameObjectData.push([4, state.gameObject.active]);
    }

    return [gameObjectData, ComponentSpecCodec.INSTANCE.encodeDelta(state.components)];
  }
  decode(data: WorldPacketData[][]): GameObjectStateDelta {
    const state = {
      gameObject: {},
      components: ComponentSpecCodec.INSTANCE.decodeDelta(data[1] as ComponentSegment[])
    } as GameObjectStateDelta;

    for (let element of data[0]) {
      const field = element[0] as number;
      const value = element[1];

      switch (field) {
        case 0:
          state.gameObject.x = value as number;
          break;
        case 1:
          state.gameObject.y = value as number;
          break;
        case 2:
          state.gameObject.isStatic = value as boolean;
          break;
        case 3:
          state.gameObject.visible = value as boolean;
          break;
        case 4:
          state.gameObject.active = value as boolean;
          break;
      }
    }

    return state;
  }
}
