import {FRACTION_DIGITS, SIMULATION_RATE} from "../constants/config";
import {CHAR_SPEED} from "../constants/world";
import {Vec2} from "./types";
import bound from "./bound";
import {toFixed} from "../utils/math";

const SIMULATION_DELTA = 1 / SIMULATION_RATE;

export default function move(pos: Vec2, dir: Vec2, delta?: number): Vec2 {
    delta = delta ? delta : SIMULATION_DELTA;

    pos.x += toFixed(dir.x * delta * CHAR_SPEED, FRACTION_DIGITS);
    pos.y += toFixed(dir.y * delta * CHAR_SPEED, FRACTION_DIGITS);

    pos = bound(pos);

    return pos;
}
