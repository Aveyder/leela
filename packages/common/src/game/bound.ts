import {CHAR_SIZE, WORLD_HEIGHT, WORLD_WIDTH} from "../constants/world";
import {Vec2} from "./types";

export default function bound(pos: Vec2): Vec2 {
    if (pos.x < CHAR_SIZE / 4) pos.x = CHAR_SIZE / 4;
    if (pos.y < CHAR_SIZE) pos.y = CHAR_SIZE;
    if (pos.x > WORLD_WIDTH - CHAR_SIZE / 4) pos.x = WORLD_WIDTH - CHAR_SIZE / 4;
    if (pos.y > WORLD_HEIGHT) pos.y = WORLD_HEIGHT;

    return pos;
}
