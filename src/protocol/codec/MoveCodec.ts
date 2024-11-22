import { Vec2 } from "../../utils/math";
import WorldPacket, { WorldPacketData } from "../WorldPacket";
import { _Codec } from "../Codec";

export default class MoveCodec implements _Codec<Vec2> {
  encode(dir: Vec2): WorldPacketData {
    return [(1 + dir.x) * 3 + (1 + dir.y)];
  }
  decode(packet: WorldPacket): Vec2 {
    const move = packet[1] as number;
    const result = {x: 0, y: 0};

    result.x = -1;
    if (move > 2) {
      result.x = 0;
    }
    if (move > 5) {
      result.x = 1;
    }
    result.y = move - 4 - 3 * result.x;

    return result;
  }
}
