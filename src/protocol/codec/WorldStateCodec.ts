import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import { DeltaGameObjectStateCodec, GameObjectStateCodec } from "./GameObjectStateCodec";
import { WorldStateDelta, WorldState } from "../../entity/WorldState";
import { GameObjectStateDelta, GameObjectState } from "../../entity/GameObjectState";

export class WorldStateCodec implements SymmetricCodec<WorldState> {

  encode(worldState: WorldState): WorldPacketData {
    const data = [worldState.timestamp] as WorldPacketData;

    Array.from(worldState.objects.values()).forEach(
      gameObjectState => data.push(GameObjectStateCodec.INSTANCE.encode(gameObjectState))
    );

    return data;
  }
  decode(data: WorldPacketData): WorldState {
    const timestamp = data[0] as number;
    const gameObjectsSegment = data.slice(1) as WorldPacketData[];
    return {
      timestamp,
      objects: gameObjectsSegment.reduce((acc: Map<number, GameObjectState>, data: WorldPacketData) => {
        acc.set(data[0] as number, GameObjectStateCodec.INSTANCE.decode(data as WorldPacketData));

        return acc;
      }, new Map<number, GameObjectState>())
    };
  }
}

export class DeltaWorldStateCodec implements SymmetricCodec<WorldStateDelta> {

  public static readonly INSTANCE: DeltaWorldStateCodec = new DeltaWorldStateCodec();

  delta(worldStateA: WorldState, worldStateB: WorldState): WorldStateDelta {
    const deltaWorldState = {
      timestamp: worldStateB.timestamp,
      objects: new Map()
    } as WorldStateDelta;

    for (const guid of worldStateB.objects.keys()) {
      const gameObjectA = worldStateA.objects.get(guid);
      const gameObjectB = worldStateB.objects.get(guid)!;

      if (!gameObjectA) continue;

      const delta = DeltaGameObjectStateCodec.INSTANCE.delta(gameObjectA, gameObjectB);

      deltaWorldState.objects.set(guid, delta);
    }
    return deltaWorldState;
  }
  encode(deltaWorldState: WorldStateDelta): WorldPacketData {
    const data = [deltaWorldState.timestamp] as WorldPacketData;
    for (const guid of deltaWorldState.objects.keys()) {
      const gameObjectState = deltaWorldState.objects.get(guid)!;

      data.push([
        guid, ...DeltaGameObjectStateCodec.INSTANCE.encode(gameObjectState)
      ])
    }

    return data;
  }
  decode(data: WorldPacketData): WorldStateDelta {
    const timestamp = data[0] as number;
    const gameObjectsSegment = data.slice(1) as WorldPacketData[];
    return {
      timestamp,
      objects: gameObjectsSegment.reduce((acc: Map<number, GameObjectStateDelta>, data: WorldPacketData) => {
        acc.set(data[0] as number, DeltaGameObjectStateCodec.INSTANCE.decode(data.slice(1) as WorldPacketData[][]));

        return acc;
      }, new Map<number, GameObjectStateDelta>())
    };
  }
}
