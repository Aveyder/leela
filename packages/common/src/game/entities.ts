import {SkinId} from "./types";

interface Entity {
    id: number;
}

interface Positioned {
    x: number;
    y: number;
}

interface Char extends Entity, Positioned {
    skin: SkinId
}

export {
    Char
};