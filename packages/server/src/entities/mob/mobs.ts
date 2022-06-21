import World from "../../world/World";
import Mob from "./Mob";
import {scaleVec2, WORLD_HEIGHT, WORLD_WIDTH} from "@leela/common";
import {addUnitToWorld, Unit} from "../Unit";
import {Type} from "../Type";
import {moveUnit} from "../../movement/movement";

function spawnMob(world: World) {
    const mob = new Mob(world);

    mob.guid = world.guid;
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

const tmpVec2 = {x: 0, y: 0};

function updateMobs(world: World, delta: number) {
    const units = world.units;

    Object.keys(units)
        .map(guid => units[guid] as Unit)
        .filter(unit => unit.type == Type.MOB)
        .forEach((mob: Mob) => updateMob(mob, delta));
}

function updateMob(mob: Mob, delta: number) {
    const progress = mob.moveProgress += delta;
    const shift = mob.moveShift;
    const s = mob.moveS;

    const dir = tmpVec2;

    dir.x = Math.sin(progress / s + shift);
    dir.y = Math.cos(progress + shift / s);

    moveUnit(mob, scaleVec2(dir, delta));
}

export {
    spawnMob,
    updateMobs
}
