import World from "../world/World";
import {Opcode} from "@leela/common";

export default interface GameObject {
    world: World;
    guid: number;
    typeId: number;
}

function deleteObjectFromWorld(object: GameObject) {
    const world = object.world;

    delete world.units[object.guid];

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

export {
    deleteObjectFromWorld,
    cloneObject
}