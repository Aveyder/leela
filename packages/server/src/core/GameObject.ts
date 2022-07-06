import World from "../world/World";
import {Opcode, Type} from "@leela/common";

export default interface GameObject {
    world: World;
    guid: number;
    typeId: number;
}

function deleteObjectFromWorld(object: GameObject) {
    const world = object.world;

    switch (object.typeId) {
        case Type.MOB:
        case Type.PLAYER:
            delete object.world.units[object.guid];
            break;
        case Type.PLANT:
            delete object.world.plants[object.guid];
            break;
    }

    world.forEachSession(worldSession => {
        delete worldSession.lastSentUpdate[object.guid];
        worldSession.sendPacket([Opcode.SMSG_DESTROY, object.guid]);
    });
}

function cloneObject(object: GameObject, result?: GameObject) {
    if (!result) {
        result = {} as GameObject;
    }

    return Object.assign(result, object);
}

function isInWorld(object: GameObject) {
    switch (object.typeId) {
        case Type.MOB:
        case Type.PLAYER:
            return object.world.units[object.guid] != undefined;
        case Type.PLANT:
            return object.world.plants[object.guid] != undefined;
    }
    return false;
}

export {
    deleteObjectFromWorld,
    cloneObject,
    isInWorld
}