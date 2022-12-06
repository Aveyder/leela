import World from "../world/World";
import {Body, Role} from "@leela/common";
import GameObject, {_addObjectToWorld, _deleteObjectFromWorld} from "./GameObject";

interface Unit extends GameObject, Body {
    world: World;
    guid: number;
    typeId: number;
    static: boolean;
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
    name: string;
}

function _addUnitToWorld(unit: Unit) {
    const world = unit.world;

    world.units[unit.guid] = unit;
    world.physics.collideAndRespond(unit);

    _addObjectToWorld(unit);
}

function _deleteUnitFromWorld(unit: Unit) {
    delete unit.world.units[unit.guid];

    _deleteObjectFromWorld(unit);
}

export {
    Unit,
    _addUnitToWorld,
    _deleteUnitFromWorld
}
