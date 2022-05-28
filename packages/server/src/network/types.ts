import {ClientId, Packet} from "@leela/common";

type AddressedPacket = [ClientId, Packet];
type RoomId = string;

export {
    AddressedPacket,
    RoomId
};
