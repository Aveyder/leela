import {WorldPacket} from "@leela/common";
import WorldSession from "../WorldSession";

export default interface WorldPacketHandler {
    (worldSession: WorldSession, worldPacket: WorldPacket, delta: number): void;
}
