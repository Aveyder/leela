import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import Move from "../../entity/Move";

export default class MoveCodec implements SymmetricCodec<Move> {
  encode(move: Move): WorldPacketData {
    return [move.tick, (1 + move.dir.x) * 3 + (1 + move.dir.y)];
  }
  decode(data: WorldPacketData): Move {
    const tick = data[0] as number;
    const move = data[1] as number;
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
