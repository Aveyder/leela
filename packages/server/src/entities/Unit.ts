import World from "../world/World";

interface Unit {
    world: World;
    guid: number;
    type: number;
    skin: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

function addUnitToWorld(unit: Unit) {
    const world = unit.world;
    const guid = unit.guid;
    const physics = world.physics;

    world.units[guid] = unit;

    physics.update(unit);
}

export {
    Unit,
    addUnitToWorld
}
