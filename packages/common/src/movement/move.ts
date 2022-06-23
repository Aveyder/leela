import {Vec2} from "../utils/math";
import {UNIT_SPEED} from "../constants/world";

export default function applySpeed(vec2: Vec2, result?: Vec2): Vec2 {
    if (!result) {
        result = {x: 0, y: 0};
    }

    result.x = vec2.x * UNIT_SPEED;
    result.y = vec2.y * UNIT_SPEED;

    return result;
}
