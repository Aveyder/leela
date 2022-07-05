import WorldSession from "../client/WorldSession";
import {WorldPacket} from "@leela/common";
import {itemTexture} from "../entities/Item";
import Depth from "../world/Depth";
import WorldScene from "../world/WorldScene";
import {getState} from "../entities/PlayerState";

function handlePutItem(worldSession: WorldSession, worldPacket: WorldPacket) {
    const slot = worldPacket[1] as number;
    const id = worldPacket[2] as number;
    const stack = worldPacket[3] as number;

    const inventory = getState(worldSession.player).inventory;

    inventory.putItem(slot, {id, stack});

    drawPutItemTween(worldSession.worldScene, id);
}

function drawPutItemTween(worldScene: WorldScene, id: number) {
    const texture = itemTexture[id];
    const itemIcon = worldScene.add.image(580, 580, texture.key, texture.frame);
    itemIcon.alpha = 1;
    itemIcon.depth = Depth.HUD;
    worldScene.add.tween({
        targets: itemIcon,
        x: 620,
        y: 620,
        alpha: 0.25,
        ease: "Linear",
        duration: 800,
        onComplete: () => itemIcon.destroy()
    });
}

export {
    handlePutItem
}