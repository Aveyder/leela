import World from "../world/World";
import {Opcode} from "@leela/common";

export default interface GameObject {
    world: World;
    guid: number;
    typeId: number;
    static: boolean;
}

function _addObjectToWorld(object: GameObject) {
    object.world.gameObjects[object.guid] = object;
}

function _deleteObjectFromWorld(object: GameObject) {
    const world = object.world;
    const guid = object.guid;

    delete world.gameObjects[guid];

    world.forEachSession(worldSession => {
        delete worldSession.gameObjects[guid];

        worldSession.sendPacket([Opcode.SMSG_DESTROY, guid]);
    });
}

function cloneObject(object: GameObject, result?: GameObject) {
    if (!result) {
        result = {} as GameObject;
    }

    return Object.assign(result, object);
}

function isInWorld(object: GameObject) {
    return object.world.gameObjects[object.guid] != undefined;
}

export {
    _addObjectToWorld,
    _deleteObjectFromWorld,
    cloneObject,
    isInWorld
}