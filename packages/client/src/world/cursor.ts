import WorldScene from "./WorldScene";
import Depth from "./Depth";
import GameObject, {canInteract} from "../core/GameObject";
import Unit, {hasRole} from "../core/Unit";
import Plant from "../plant/Plant";
import {Role, Type} from "@leela/common";
import {gatherPlant} from "../plant/gather";
import POINTER_UP = Phaser.Input.Events.POINTER_UP;
import Pointer = Phaser.Input.Pointer;

function initCursor(worldScene: WorldScene) {
    worldScene.input.setDefaultCursor(`none`);

    const cursor = worldScene.add.image(0, 0, "cursor");
    cursor.depth = Depth.CURSOR;

    worldScene.input.on(POINTER_UP, (pointer: Pointer, currentlyOver: GameObject[]) => {
        const gameObject = currentlyOver[0] as Unit | Plant;

        if (!gameObject) return;

        const player = worldScene.worldSession?.player;

        if (!player) return;

        if (canInteract(player, gameObject)) {
            if (gameObject.typeId == Type.PLANT) gatherPlant(player, gameObject as Plant);
        }
    });

    return cursor;
}

function updateCursor(worldScene: WorldScene) {
    const cursor = worldScene.cursor;
    const activePointer = worldScene.input.activePointer;

    cursor.alpha = 1;
    cursor.setPosition(activePointer.worldX, activePointer.worldY);

    const currentlyOver = worldScene.input.hitTestPointer(activePointer)[0] as unknown as Plant | Unit;

    if (currentlyOver) {
        const player = worldScene.worldSession?.player;
        if (player && currentlyOver?.typeId) {
            cursor.alpha = canInteract(player, currentlyOver) ? 1 : 0.6;

            if (currentlyOver.typeId == Type.PLANT) {
                cursor.setTexture("cursor-plant");
            }
            if (hasRole(currentlyOver as Unit, Role.VENDOR)) {
                cursor.setTexture("cursor-vendor");
            }
            cursor.setOrigin(0, 0);
        } else {
            cursor.setTexture("cursor-hand");
        }
    } else {
        cursor.setTexture("cursor");
        cursor.setOrigin(0.25, 0);
    }
}

export {
    initCursor,
    updateCursor
}
