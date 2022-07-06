import WorldScene from "../world/WorldScene";
import {PhysicsWorld} from "@leela/common";

function initPhysicsWorld(worldScene: WorldScene) {
    const map = worldScene.cache.tilemap.get("map").data;

    return  new PhysicsWorld({
        data: map.layers.find(layer => layer.name == "collision").data,
        tilesWidth: map.width,
        tilesHeight: map.height,
        tileSize: map.tileheight
    });
}

export {
    initPhysicsWorld
}
