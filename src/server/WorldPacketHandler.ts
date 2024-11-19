import WorldSession from "./WorldSession";
import WorldPacket from "../protocol/WorldPacket";
import { Codec } from "../protocol/_Codec";

export default interface WorldPacketHandler {
    (session: WorldSession, packet: WorldPacket, delta: number): void;
}

export interface ObjectHandler<T> {
    (session: WorldSession, object: T, delta: number): void;
}

export function objectHandler<T>(objectHandler: ObjectHandler<T>): WorldPacketHandler {
    return (session: WorldSession, packet: WorldPacket, delta) => {
        objectHandler(session, Codec.decode(packet), delta);
    }
}
