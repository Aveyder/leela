import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import WorldState from "../../entity/WorldState";
import GameObjectStateCodec from "./GameObjectStateCodec";
import GameObjectState from "../../entity/GameObjectState";

export default class WorldStateCodec implements SymmetricCodec<WorldState> {

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
