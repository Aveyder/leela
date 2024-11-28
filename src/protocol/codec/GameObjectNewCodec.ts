import { SymmetricCodec } from "../Codec";
import { GameObjectNew } from "../../entity/GameObjectNew";
import { WorldPacketData } from "../WorldPacket";
import { GameObjectStateCodec } from "./GameObjectStateCodec";

export default class GameObjectNewCodec implements SymmetricCodec<GameObjectNew> {
    encode(object: GameObjectNew): WorldPacketData {
      return [object.timestamp, ...GameObjectStateCodec.INSTANCE.encode(object.state)];
    }
    decode(data: WorldPacketData): GameObjectNew {
      return {
        timestamp: data[0] as number,
        state: GameObjectStateCodec.INSTANCE.decode(data.slice(1))
      };
    }
}
