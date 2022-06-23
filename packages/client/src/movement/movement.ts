import {applySpeed, PhysicsWorld, Vec2} from "@leela/common";

function moveUnit(physics: PhysicsWorld, unit: Vec2, vec2: Vec2) {
    applySpeed(vec2, vec2);
    physics.move(unit, vec2, unit);
}

export {
    moveUnit
}
