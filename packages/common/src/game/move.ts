import {FRACTION_DIGITS, SIMULATION_RATE} from "../constants/config";
import {CHAR_SPEED} from "../constants/world";
import {Vec2} from "./types";
import bound from "./bound";
import {toFixed} from "../utils/math";

const SIMULATION_DELTA = 1 / SIMULATION_RATE;

export default function move(pos: Vec2, dir: Vec2, delta?: number, result?: Vec2): Vec2 {
    if (!result) {
        result = {x: 0, y: 0};
    }
    delta = delta ? delta : SIMULATION_DELTA;

    result.x = pos.x + dir.x * delta * CHAR_SPEED;
    result.y = pos.y + dir.y * delta * CHAR_SPEED;

    bound(result, result);

    return result;
}
