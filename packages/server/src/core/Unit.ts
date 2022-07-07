import World from "../world/World";
import {Body, Role, Type} from "@leela/common";
import Player from "../player/Player";

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

function deleteUnitFromWorld(unit: Unit) {
    const world = unit.world;

    if (unit.typeId == Type.PLAYER) {
        const player = unit as Player;

        const worldSession = player.worldSession;

        worldSession.player = null;
    }

    delete world.units[unit.guid];
}

export {
    Unit,
    addUnitToWorld,
    deleteUnitFromWorld
}
