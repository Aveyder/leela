import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import { DeltaGameObjectStateCodec, GameObjectStateCodec } from "./GameObjectStateCodec";
import { DeltaWorldState, WorldState } from "../../entity/WorldState";
import { DeltaGameObjectState, GameObjectState } from "../../entity/GameObjectState";
import { DeltaComponentSpec } from "../../entity/ComponentSpec";
import ComponentCodec from "./ComponentCodec";

export class WorldStateCodec implements SymmetricCodec<WorldState> {

  encode(worldState: WorldState): WorldPacketData {
    return Array.from(worldState.gameObjects.values()).map(
      gameObjectState => GameObjectStateCodec.INSTANCE.encode(gameObjectState)
    );
  }
  decode(data: WorldPacketData[]): WorldState {
    return {
      gameObjects: data.reduce((acc: Map<number, GameObjectState>, data: WorldPacketData) => {
        acc.set(data[0] as number, GameObjectStateCodec.INSTANCE.decode(data as WorldPacketData));

        return acc;
      }, new Map<number, GameObjectState>())
    };
  }
}

export class DeltaWorldStateCodec implements SymmetricCodec<DeltaWorldState> {

  public static readonly INSTANCE: DeltaWorldStateCodec = new DeltaWorldStateCodec();

  delta(worldStateA: WorldState, worldStateB: WorldState): DeltaWorldState {
    const deltaWorldState = {
      gameObjects: new Map()
    } as DeltaWorldState;

    for (const guid of worldStateB.gameObjects.keys()) {
      const gameObjectA = worldStateA.gameObjects.get(guid);
      const gameObjectB = worldStateB.gameObjects.get(guid)!;

      if (!gameObjectA) continue;

      const delta = DeltaGameObjectStateCodec.INSTANCE.delta(gameObjectA, gameObjectB);

      deltaWorldState.gameObjects.set(guid, delta);
    }
    return deltaWorldState;
  }
  encode(deltaWorldState: DeltaWorldState): WorldPacketData {
    const data = [];
    for (const guid of deltaWorldState.gameObjects.keys()) {
      const gameObjectState = deltaWorldState.gameObjects.get(guid)!;

      data.push([
        guid, DeltaGameObjectStateCodec.INSTANCE.encode(gameObjectState)
      ])
    }

    return data;
  }
  decode(data: WorldPacketData[]): DeltaWorldState {
    return {
      gameObjects: data.reduce((acc: Map<number, DeltaGameObjectState>, data: WorldPacketData) => {
        acc.set(data[0] as number, DeltaGameObjectStateCodec.INSTANCE.decode(data[1] as WorldPacketData[][]));

        return acc;
      }, new Map<number, DeltaGameObjectState>())
    };
  }
}
