import WorldPacket, { WorldPacketData } from "../WorldPacket";
import { _Codec } from "../Codec";
import Move from "../../entity/Move";

export default class MoveCodec implements _Codec<Move> {
  encode(move: Move): WorldPacketData {
    return [move.tick, (1 + move.dir.x) * 3 + (1 + move.dir.y)];
  }
  decode(packet: WorldPacket): Move {
    const tick = packet[1] as number;
    const move = packet[2] as number;
    const dir = {x: 0, y: 0};

    dir.x = -1;
    if (move > 2) {
      dir.x = 0;
    }
    if (move > 5) {
      dir.x = 1;
    }
    dir.y = move - 4 - 3 * dir.x;

    return { tick, dir };
  }
}
