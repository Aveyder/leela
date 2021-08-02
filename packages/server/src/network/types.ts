import {ClientId, ClientPacket} from "@leela/common";

type AddressedPacket = [ClientId, ClientPacket];
type RoomId = string;

export {
    AddressedPacket,
    RoomId
};
