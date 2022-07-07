import WorldScene from "../world/WorldScene";
import CastBar from "../plant/CastBar";
import Depth from "../world/Depth";
import Inventory from "../inventory/Inventory";
import {getPlayerState} from "../player/PlayerState";
import POINTER_OVER = Phaser.Input.Events.POINTER_OVER;
import POINTER_OUT = Phaser.Input.Events.POINTER_OUT;
import POINTER_UP = Phaser.Input.Events.POINTER_UP;

function drawCastBar(worldScene: WorldScene, castBar: CastBar) {
    castBar.depth = Depth.HUD;
    castBar.visible = false;

    worldScene.add.existing(castBar);
}

function drawInventory(worldScene: WorldScene, inventory: Inventory) {
    inventory.setPosition(620, 595);
    inventory.setDepth(Depth.HUD);
    inventory.visible = false;

    worldScene.add.existing(inventory);
}

function initHUD(worldScene: WorldScene) {
    initInventoryButton(worldScene);
}

function initInventoryButton(worldScene: WorldScene) {
    const inventoryButton = worldScene.add.image(620, 620, "bag");

    inventoryButton.setInteractive();
    inventoryButton.setScale(0.66, 0.66);

    inventoryButton.on(POINTER_OVER, () => {
        if (!worldScene.worldSession?.player) return;
        inventoryButton.setScale(0.75, 0.75);
    });
    inventoryButton.on(POINTER_OUT, () => {
        inventoryButton.setScale(0.66, 0.66);
    });
    inventoryButton.on(POINTER_UP, () => {
        const player = worldScene.worldSession?.player;

        if (!player) return;

        const inventory = getPlayerState(player).inventory;

        inventory.visible = !inventory.visible;
    });

    inventoryButton.depth = Depth.HUD;
}

export {
    drawCastBar,
    drawInventory,
    initHUD
}