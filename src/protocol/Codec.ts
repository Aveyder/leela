import WorldPacket, { WorldPacketData } from "./WorldPacket";
import { Opcode } from "./Opcode";
import MoveCodec from "./codec/MoveCodec";
import JoinCodec from "./codec/JoinCodec";

export interface _Codec<T> {
  encode(object: T): WorldPacketData;
  decode(packet: WorldPacket) :T;
}

type CodecMapping = {
  [key in Opcode]?: _Codec<unknown>;
};

export default class Codec {
  private static readonly _codecs: CodecMapping = {
    [Opcode.CMSG_MOVE]: new MoveCodec(),
    [Opcode.MSG_JOIN]: new JoinCodec(),
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

  public static getCodec<T>(opcode: Opcode): _Codec<T> {
    return this._codecs[opcode] as _Codec<T>;
  }
}
