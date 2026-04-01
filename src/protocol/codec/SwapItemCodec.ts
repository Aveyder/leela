import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import SwapItem from "../../entity/SwapItem";

export default class SwapItemCodec implements SymmetricCodec<SwapItem> {
  encode(swap: SwapItem): WorldPacketData {
    return [swap.src, swap.dest];
  }

  decode(data: WorldPacketData): SwapItem {
    const src = data[0] as number;
    const dest = data[1] as number;

    return {src, dest};
  }
}
