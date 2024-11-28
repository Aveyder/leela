import WorldPacket, { WorldPacketData } from "./WorldPacket";
import { Opcode } from "./Opcode";
import MoveCodec from "./codec/MoveCodec";
import JoinCodec from "./codec/JoinCodec";
import { GameObjectStateCodec } from "./codec/GameObjectStateCodec";
import { DeltaWorldStateCodec, WorldStateCodec } from "./codec/WorldStateCodec";
import GameObjectNewCodec from "./codec/GameObjectNewCodec";

export interface _Codec<I, O> {
  encode(object: I): WorldPacketData;
  decode(data: WorldPacketData): O;
}

export type SymmetricCodec<T> = _Codec<T, T>;

type CodecMapping = {
  [key in Opcode]?: _Codec<unknown, unknown>;
};

export default class Codec {
  private static readonly _codecs: CodecMapping = {
    [Opcode.CMSG_MOVE]: new MoveCodec(),
    [Opcode.MSG_JOIN]: new JoinCodec(),
    [Opcode.SMSG_WORLD_INIT]: new WorldStateCodec(),
    [Opcode.SMSG_OBJECT]: new GameObjectNewCodec(),
    [Opcode.SMSG_WORLD_UPDATE]: DeltaWorldStateCodec.INSTANCE,
  }

  public static encode<I, O>(opcode: Opcode, object: I): WorldPacket {
    const codec = this.getCodec<I, O>(opcode);

    if (codec) {
      return [opcode, ...codec.encode(object)];
    } else {
      return [opcode, object];
    }
  }

  public static decode<I, O>(packet: WorldPacket): O {
    const opcode = packet[0];
    const codec = this.getCodec<I, O>(opcode);

    if (codec) {
        return codec.decode(packet.slice(1));
    } else {
        return packet[1] as O;
    }
  }

  public static getCodec<I, O>(opcode: Opcode): _Codec<I, O> {
    return this._codecs[opcode] as _Codec<I, O>;
  }
}
