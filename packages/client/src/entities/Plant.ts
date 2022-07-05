import Sprite = Phaser.GameObjects.Sprite;
import {Scene} from "phaser";
import WorldScene from "../world/WorldScene";
import Depth from "../world/Depth";
import {appear, hideAndDestroy} from "./object";
import Unit from "./Unit";
import {getState} from "./PlayerState";
import {GATHER_DURATION, Opcode} from "@leela/common";
import {CastBarStatus} from "./CastBar";

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

function gatherPlant(player: Unit, plant: Plant) {
    const playerState = getState(player);

    if(playerState.gathering?.guid == plant.guid) return;

    playerState.gathering = plant;

    const castBar = playerState.castBar;

    castBar.show();
    castBar.status = CastBarStatus.IN_PROGRESS;
    castBar.totalTime = GATHER_DURATION;
    castBar.currentTime = 0;

    const worldSession = (player.scene as WorldScene).worldSession;

    worldSession.sendPacket([Opcode.CMSG_GATHER, plant.guid]);
}


export {
    addPlantToWorld,
    deletePlantFromWorld,
    gatherPlant
}
