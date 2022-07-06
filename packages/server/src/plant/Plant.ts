import GameObject from "../entities/GameObject";
import World from "../world/World";
import {Type} from "@leela/common";

export default class Plant implements GameObject {
    public guid: number;
    public typeId: number;
    public x: number;
    public y: number;
    public kind: number;

    public readonly world: World;

    constructor(world: World) {
        this.world = world;

        this.typeId = Type.PLANT;

    }
}

const plantToItem = {
    0: 1,
    1: 2,
    2: 3,
    3: 4
}

function updatePlants(world: World) {
    if (Object.keys(world.plants).length < 100 && Math.random() < 0.01) {
        const plant = new Plant(world);

        const map = world.physics.map;

        plant.guid = world.guid();
        plant.x = (Math.random() * (map.tilesWidth - 4) + 2) * map.tileSize;
        plant.y = (Math.random() * (map.tilesHeight - 4) + 2) * map.tileSize;
        plant.kind = Math.floor(Math.random() * 4);

        addPlantToWorld(plant);
    }
}

function addPlantToWorld(plant: Plant) {
    const world = plant.world;
    const guid = plant.guid;

    world.plants[guid] = plant;
}

export {
    plantToItem,
    updatePlants,
    addPlantToWorld
}