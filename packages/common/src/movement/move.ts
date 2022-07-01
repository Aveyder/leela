import {Vec2} from "../utils/math";
import Body from "../physics/Body";
import PhysicsWorld from "../physics/PhysicsWorld";
import {SIMULATION_DELTA} from "../config";

function moveUnit(physics: PhysicsWorld, body: Body, dir: Vec2, speed: number) {
    body.vx = dir.x * speed * SIMULATION_DELTA;
    body.vy = dir.y * speed * SIMULATION_DELTA;

    physics.update(body);
}

export {
    moveUnit
}
