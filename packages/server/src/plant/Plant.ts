import GameObject, {_addObjectToWorld, _deleteObjectFromWorld} from "../core/GameObject";
import World from "../world/World";
import {Type} from "@leela/common";

export default class Plant implements GameObject {
    public guid: number;
    public readonly typeId: number;
    public readonly static: boolean;
    public x: number;
    public y: number;
    public kind: number;

    public readonly world: World;

    constructor(world: World) {
        this.world = world;

        this.typeId = Type.PLANT;
        this.static = true;
    }

    public addToWorld() {
        this.world.plants[this.guid] = this;

        _addObjectToWorld(this);
    }

    public deleteFromWorld() {
        delete this.world.plants[this.guid];

        _deleteObjectFromWorld(this);
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

        plant.addToWorld();
    }
}

export {
    plantToItem,
    updatePlants
}
