import {Vec2} from "../utils/math";
import {UNIT_SPEED} from "../constants/world";
import Body from "../physics/Body";
import PhysicsWorld from "../physics/PhysicsWorld";

function moveUnit(physics: PhysicsWorld, unit: Body, vec2: Vec2) {
    applyUnitSpeed(unit, vec2);
    physics.update(unit);
}

function applyUnitSpeed(body: Body, vec2: Vec2) {
    body.vx = vec2.x * UNIT_SPEED;
    body.vy = vec2.y * UNIT_SPEED;
}

export {
    moveUnit
}
