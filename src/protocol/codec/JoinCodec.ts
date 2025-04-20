import Join from "../../entity/Join";
import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import { MODELS_BY_ID } from "../../resource/Model";

export default class JoinCodec implements SymmetricCodec<Join> {
  encode(join: Join): WorldPacketData {
    return [join.model.id, join.name];
  }
  decode(data: WorldPacketData): Join {
    const modelId = data[0] as number;
    return {
      model: MODELS_BY_ID.get(modelId),
      name: data[2] as string
    };
  }
}
