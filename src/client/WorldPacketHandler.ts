import WorldSession from "./WorldSession";
import WorldPacket from "../protocol/WorldPacket";
import { Codec } from "../protocol/_Codec";

export default interface WorldPacketHandler {
    (session: WorldSession, packet: WorldPacket): void;
}

export interface ObjectHandler<T> {
    (session: WorldSession, object: T): void;
}

export function worldPacketHandler<T>(objectHandler: ObjectHandler<T>): WorldPacketHandler {
    return (session: WorldSession, packet: WorldPacket) => {
        objectHandler(session, Codec.decode(packet));
    }
}
