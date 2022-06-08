import {Vec2} from "../utils/math";
import {CHAR_SPEED} from "../constants/world";

export default function move(vec2: Vec2, result?: Vec2): Vec2 {
    if (!result) {
        result = {x: 0, y: 0};
    }

    result.x = vec2.x * CHAR_SPEED;
    result.y = vec2.y * CHAR_SPEED;

    return result;
}
