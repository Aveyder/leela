import {applySpeed, Vec2} from "@leela/common";
import {Unit} from "../entities/Unit";

function moveUnit(unit: Unit, vec2: Vec2) {
    const world = unit.world;

    applySpeed(vec2, vec2);
    world.physics.move(unit, vec2, unit);

    unit.vx = vec2.x;
    unit.vy = vec2.y;
}

export {
    moveUnit
}
