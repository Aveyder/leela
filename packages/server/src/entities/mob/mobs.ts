import World from "../../world/World";
import Mob from "./Mob";
import {moveUnit, scaleVec2, SIMULATION_DELTA, TMP_VEC2, Type, WORLD_HEIGHT, WORLD_WIDTH} from "@leela/common";
import {addUnitToWorld} from "../Unit";

function spawnMob(world: World) {
    const mob = new Mob(world);

    mob.guid = world.guid();
    mob.skin = 5;
    mob.x = Math.random() * WORLD_WIDTH;
    mob.y = Math.random() * WORLD_HEIGHT;
    mob.vx = 0;
    mob.vy = 0;

    mob.moveProgress = 0;
    mob.moveShift = Math.random();
    mob.moveS = Math.random();

    addUnitToWorld(mob);
}

function updateMobs(world: World) {
    Object.values(world.units)
        .filter(unit => unit.typeId == Type.MOB)
        .forEach((mob: Mob) => updateMob(mob));
}

function updateMob(mob: Mob) {
    const progress = mob.moveProgress += SIMULATION_DELTA;
    const shift = mob.moveShift;
    const s = mob.moveS;

    const dir = TMP_VEC2;

    dir.x = Math.sin(progress / s + shift);
    dir.y = Math.cos(progress + shift / s);

    const physics = mob.world.physics;

    moveUnit(physics, mob, scaleVec2(dir, SIMULATION_DELTA));
}

export {
    spawnMob,
    updateMobs
}
