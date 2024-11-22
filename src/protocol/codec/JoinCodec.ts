import Join from "../../entity/Join";
import WorldPacket, { WorldPacketData } from "../WorldPacket";
import { _Codec } from "../Codec";

export default class JoinCodec implements _Codec<Join> {
  encode(join: Join): WorldPacketData {
    return [join.modelId, join.name];
  }
  decode(packet: WorldPacket): Join {
    return {
      modelId: packet[1] as number,
      name: packet[2] as string
    };
  }
}
