import {moveUnit, PhysicsWorld, scaleVec2, SIMULATION_DELTA, TMP_VEC2, UNIT_SPEED, Vec2} from "@leela/common";
import {Unit} from "../entities/Unit";

interface Motion {
    update(delta: number);
}

type Waypoint = [Vec2, number];

class PathMotion implements Motion {

    private static readonly ALLOWED_POSITION_ERROR = 0.1;

    private readonly unit: Unit;
    private readonly physics: PhysicsWorld;
    private readonly waypoints: Waypoint[];
    private headingWaypoint: number;
    private timer: number;
    private moving: boolean;

    constructor(unit: Unit, path: Waypoint[]) {
        this.unit = unit;
        this.physics = unit.world.physics;
        this.waypoints = path;
        this.headingWaypoint = 0;
        this.timer = 0;
        this.moving = false;
    }

    public update(delta: number): void {
        if (!this.moving) this.wait(delta);
        if (this.moving) this.move();
    }

    private wait(delta: number) {
        const wait = this.waypoints[this.headingWaypoint][1];

        this.timer += delta;

        if (this.timer > wait) {
            this.timer = 0;
            this.headingWaypoint = (this.headingWaypoint + 1) % this.waypoints.length;
            this.moving = true;
        } else {
            this.unit.vx = 0;
            this.unit.vy = 0;
        }
    }

    private move() {
        const position = this.waypoints[this.headingWaypoint][0];

        const dx = position.x - this.unit.x;
        const dy = position.y - this.unit.y;

        const dir = TMP_VEC2;

        const stepDistance = UNIT_SPEED * SIMULATION_DELTA;

        dir.x = Math.abs(dx) > stepDistance ? Math.sign(dx) : dx / stepDistance;
        dir.y = Math.abs(dy) > stepDistance ? Math.sign(dy) : dy / stepDistance;

        moveUnit(this.physics, this.unit, scaleVec2(dir, SIMULATION_DELTA));

        if (Math.abs(this.unit.x - position.x) <= PathMotion.ALLOWED_POSITION_ERROR &&
            Math.abs(this.unit.y - position.y) <= PathMotion.ALLOWED_POSITION_ERROR) {
            this.moving = false;
        }
    }
}

export {
    Motion,
    Waypoint,
    PathMotion
}