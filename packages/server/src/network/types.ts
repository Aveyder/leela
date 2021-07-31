import {ClientId, Data} from "@leela/common";

type IdentifiedData = [ClientId, ...Data];
type RoomId = string;

export {
    IdentifiedData,
    RoomId
};
