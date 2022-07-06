import WorldScene from "./WorldScene";
import Depth from "./Depth";

function drawTiledMap(worldScene: WorldScene) {
    const tilemap = worldScene.add.tilemap("map");

    const baseTileset = tilemap.addTilesetImage("base", "base");
    const grassTileset = tilemap.addTilesetImage("grass", "grass");

    const groundLayer = tilemap.createLayer("ground", [baseTileset, grassTileset]);
    const itemLayer = tilemap.createLayer("item", baseTileset);
    const treeLayer = tilemap.createLayer("tree", baseTileset);
    const buildingLayer = tilemap.createLayer("building", baseTileset);

    groundLayer.depth = Depth.MAP;
    itemLayer.depth = Depth.MAP;
    buildingLayer.depth = Depth.BUILDING;
    treeLayer.depth = Depth.TREE;
}

export {
    drawTiledMap
}