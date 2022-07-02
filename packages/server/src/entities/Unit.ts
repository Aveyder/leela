import World from "../world/World";
import {Body, Opcode} from "@leela/common";

interface Unit extends Body {
    world: World;
    guid: number;
    typeId: number;
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

    delete world.units[unit.guid];

    world.forEachSession(session => session.sendPacket([Opcode.SMSG_DESTROY, unit.guid]));
}

export {
    Unit,
    addUnitToWorld,
    deleteUnitFromWorld
}
