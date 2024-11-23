import Join from "../../entity/Join";
import WorldPacket, { WorldPacketData } from "../WorldPacket";
import { _Codec } from "../Codec";
import { MODELS_BY_ID } from "../../resource/Model";

export default class JoinCodec implements _Codec<Join> {
  encode(join: Join): WorldPacketData {
    return [join.model.id, join.name];
  }
  decode(packet: WorldPacket): Join {
    const modelId = packet[1] as number;
    return {
      model: MODELS_BY_ID.get(modelId)!,
      name: packet[2] as string
    };
  }
}
