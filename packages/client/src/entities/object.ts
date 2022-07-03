import WorldScene from "../world/WorldScene";
import PhaserGameObject = Phaser.GameObjects.GameObject;
import Sprite = Phaser.GameObjects.Sprite;


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

export {
    GameObject,
    appear,
    hideAndDestroy
}