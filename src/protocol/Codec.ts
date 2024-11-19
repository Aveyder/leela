import WorldPacket, { WorldPacketData } from "./WorldPacket";
import { Opcode } from "./Opcode";
import { Vec2 } from "../utils/math";
import WorldSession from "../client/WorldSession";
import WorldPacketHandler, { ObjectHandler } from "../client/WorldPacketHandler";

interface codec<T> {
  encode(object: T): WorldPacketData;
  decode(packet: WorldPacket) :T;
}

class MoveCodec implements codec<Vec2> {
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

type CodecMapping = {
  [key in Opcode]?: codec<unknown>;
};

export default class Codec {
  private static readonly _codecs: CodecMapping = {
    [Opcode.CMSG_MOVE]: new MoveCodec()
  }

  public static encode<T>(opcode: Opcode, object: T): WorldPacket {
    const codec = this.getCodec(opcode);

    if (codec) {
      return [opcode, ...codec.encode(object)];
    } else {
      return [opcode, object];
    }
  }

  public static decode<T>(packet: WorldPacket): T {
    const opcode = packet[0];
    const codec = this.getCodec<T>(opcode);

    if (codec) {
        return codec.decode(packet);
    } else {
        return packet[1] as T;
    }
  }

  public static getCodec<T>(opcode: Opcode): codec<T> {
    return this._codecs[opcode] as codec<T>;
  }
}
