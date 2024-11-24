import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import WorldState from "../../entity/WorldState";
import GameObjectStateCodec from "./GameObjectStateCodec";

export default class WorldStateCodec implements SymmetricCodec<WorldState> {

  encode(worldState: WorldState): WorldPacketData {
    return worldState.gameObjects.map(
      gameObjectState => GameObjectStateCodec.INSTANCE.encode(gameObjectState)
    );
  }
  decode(data: WorldPacketData): WorldState {
    return {
      gameObjects: data.map((data) => GameObjectStateCodec.INSTANCE.decode(data as WorldPacketData))
    }
  }
}
