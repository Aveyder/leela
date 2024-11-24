import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import { GameObjectStateCodec } from "./GameObjectStateCodec";
import { DeltaWorldState, WorldState } from "../../entity/WorldState";
import { GameObjectState } from "../../entity/GameObjectState";

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
    return {} as DeltaWorldState;
  }
  encode(worldState: DeltaWorldState): WorldPacketData {
    return [];
  }
  decode(data: WorldPacketData[]): DeltaWorldState {
    return {} as DeltaWorldState;
  }
}
