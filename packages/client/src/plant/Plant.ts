import Sprite = Phaser.GameObjects.Sprite;
import {Scene} from "phaser";
import WorldScene from "../world/WorldScene";
import Depth from "../world/Depth";
import {appear, hideAndDestroy} from "../entities/GameObject";

export default class Plant extends Sprite {

    public guid: number;
    public typeId: number;

    constructor(scene: Scene, kind = 0, x?: number, y?: number) {
        super(scene, x, y, "base", 52 + kind);
    }
}

function addPlantToWorld(plant: Plant) {
    const worldScene = plant.scene as WorldScene;

    worldScene.add.existing(plant);

    plant.depth = Depth.PLANT + plant.y / 1000000;

    const guid = plant.guid;

    worldScene.plants[guid] = plant;

    appear(plant);
}

function deletePlantFromWorld(plant: Plant) {
    const worldScene = plant.scene as WorldScene;

    hideAndDestroy(plant);

    delete worldScene.plants[plant.guid];
}


export {
    addPlantToWorld,
    deletePlantFromWorld
}
