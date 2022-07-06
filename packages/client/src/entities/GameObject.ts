import WorldScene from "../world/WorldScene";
import {INTERACT_MAX_DISTANCE} from "@leela/common";
import Unit from "./Unit";
import Plant from "../plant/Plant";
import PhaserGameObject = Phaser.GameObjects.GameObject;
import Sprite = Phaser.GameObjects.Sprite;
import Between = Phaser.Math.Distance.Between;


export default interface GameObject {
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

function hideAndDestroy(gameObject: PhaserGameObject) {
    const worldScene = gameObject.scene as WorldScene;

    gameObject.disableInteractive();

    worldScene.tweens.killTweensOf(gameObject);
    worldScene.add.tween({
        targets: gameObject,
        alpha: 0,
        ease: "Linear",
        duration: 500,
        onComplete: () => gameObject.destroy()
    });
}

function canInteract(player: Unit, gameObject: Unit | Plant) {
    if (gameObject.typeId == undefined) return false;

    const distance = Between(player.x, player.y, gameObject.x, gameObject.y);

    return distance <= INTERACT_MAX_DISTANCE;
}

export {
    appear,
    hideAndDestroy,
    canInteract
}