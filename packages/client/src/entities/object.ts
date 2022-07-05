import WorldScene from "../world/WorldScene";
import {INTERACT_MAX_DISTANCE} from "@leela/common";
import Unit from "./Unit";
import Plant from "./Plant";
import PhaserGameObject = Phaser.GameObjects.GameObject;
import Sprite = Phaser.GameObjects.Sprite;
import Between = Phaser.Math.Distance.Between;


interface GameObject {
    guid: number;
    typeId: number;
}

function appear(gameObject: Sprite) {
    const worldScene = gameObject.scene as WorldScene;

    gameObject.alpha = 0;
    worldScene.add.tween({
        targets: gameObject,
        alpha: 1,
        ease: "Linear",
        duration: 500
    });
}

function hideAndDestroy(object: PhaserGameObject) {
    const worldScene = object.scene as WorldScene;

    object.disableInteractive();

    worldScene.tweens.killTweensOf(object);
    worldScene.add.tween({
        targets: object,
        alpha: 0,
        ease: "Linear",
        duration: 500,
        onComplete: () => object.destroy()
    });
}

function canInteract(player: Unit, gameObject: Unit | Plant) {
    if (gameObject.typeId == undefined) return false;

    const distance = Between(player.x, player.y, gameObject.x, gameObject.y);

    return distance <= INTERACT_MAX_DISTANCE;
}

export {
    GameObject,
    appear,
    hideAndDestroy,
    canInteract
}