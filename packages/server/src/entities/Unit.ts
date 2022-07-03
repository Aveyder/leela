import World from "../world/World";
import {Body, Role} from "@leela/common";

interface Unit extends Object, Body {
    world: World;
    guid: number;
    typeId: number;
    roles: Role[];
    skin: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    bullet: boolean;
    speed: number;
}

function addUnitToWorld(unit: Unit) {
    const world = unit.world;
    const guid = unit.guid;
    const physics = world.physics;

    world.units[guid] = unit;

    physics.collideAndRespond(unit);
}

export {
    Unit,
    addUnitToWorld
}
