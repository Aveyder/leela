import {CHAR_SIZE, WORLD_HEIGHT, WORLD_WIDTH} from "../constants/world";
import {Vec2} from "./types";

export default function bound(pos: Vec2, result?: Vec2): Vec2 {
    if (!result) {
        result = {x: 0, y: 0};
    }
    if (pos.x < CHAR_SIZE / 2) result.x = CHAR_SIZE / 2;
    if (pos.y < CHAR_SIZE / 2) result.y = CHAR_SIZE / 2;
    if (pos.x > WORLD_WIDTH - CHAR_SIZE / 2) result.x = WORLD_WIDTH - CHAR_SIZE / 2;
    if (pos.y > WORLD_HEIGHT - CHAR_SIZE /2) result.y = WORLD_HEIGHT - CHAR_SIZE / 2;

    return result;
}
