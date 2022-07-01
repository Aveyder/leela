import World from "../../world/World";
import Mob from "./Mob";
import {TILE_SIZE, Type} from "@leela/common";
import {addUnitToWorld} from "../Unit";
import {PathMotion, Waypoint} from "../../motion/motions";

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
        [{x: TILE_SIZE * 3 / 2 + TILE_SIZE * 17, y: TILE_SIZE * 3 / 2}, 0],
        [{x: TILE_SIZE * 3 / 2 + TILE_SIZE * 17, y: TILE_SIZE * 3 / 2 + TILE_SIZE * 6}, 0],
        [{x: TILE_SIZE * 3 / 2 + TILE_SIZE * 8, y: TILE_SIZE * 3 / 2 + TILE_SIZE * 5}, 0],
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
