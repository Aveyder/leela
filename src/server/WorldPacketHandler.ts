import WorldSession from "./WorldSession";
import WorldPacket from "../protocol/WorldPacket";
import { Codec } from "../protocol/_Codec";

export default interface WorldPacketHandler {
    (worldSession: WorldSession, worldPacket: WorldPacket, delta: number): void;
}

export interface ObjectHandler<T> {
    (worldSession: WorldSession, object: T, delta: number): void;
}

export function worldPacketHandler<T>(objectHandler: ObjectHandler<T>): WorldPacketHandler {
    return (worldSession: WorldSession, worldPacket: WorldPacket, delta) => {
        objectHandler(worldSession, Codec.decode(worldPacket), delta);
    }
}
