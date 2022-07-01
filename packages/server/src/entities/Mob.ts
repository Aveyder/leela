import World from "../world/World";
import {addUnitToWorld, Unit} from "./Unit";
import {TILE_SIZE, Type, UNIT_BODY_HEIGHT, UNIT_BODY_WIDTH} from "@leela/common";
import {Motion, PathMotion, Waypoint} from "../motion/motions";

export default class Mob implements Unit {
    public guid: number;
    public typeId: number;
    public skin: number;
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public readonly width: number;
    public readonly height: number;
    public readonly bullet: boolean;
    public motion: Motion;

    public readonly world: World;

    constructor(world: World) {
        this.world = world;

        this.typeId = Type.MOB;
        this.width = UNIT_BODY_WIDTH;
        this.height = UNIT_BODY_HEIGHT;
        this.bullet = false;
    }
}

function spawnMob(world: World) {
    const mob = new Mob(world);

    mob.guid = world.guid();
    mob.skin = 5;
    mob.x = TILE_SIZE * 3 / 2 + TILE_SIZE * 8;
    mob.y = TILE_SIZE * 3 / 2;
    mob.vx = 0;
    mob.vy = 0;

    const path = [
        [{x: TILE_SIZE * 3 / 2 + TILE_SIZE * 8, y: TILE_SIZE * 3 / 2}, 0],
        [{x: TILE_SIZE * 3 / 2 + TILE_SIZE * 17, y: TILE_SIZE * 3 / 2}, 0]
    ];

    mob.motion = new PathMotion(mob, path as Waypoint[]);

    addUnitToWorld(mob);
}

function updateMobs(world: World, delta) {
    Object.values(world.units)
        .filter(unit => unit.typeId == Type.MOB)
        .forEach((mob: Mob) => mob.motion.update(delta));
}

export {
    spawnMob,
    updateMobs
}
