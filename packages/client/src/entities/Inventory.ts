import Image = Phaser.GameObjects.Image;
import Container = Phaser.GameObjects.Container;
import Text = Phaser.GameObjects.Text;
import {Scene} from "phaser";
import {INVENTORY_SIZE} from "@leela/common";
import Slot from "./Slot";
import {itemTexture} from "./Item";

export default class Inventory extends Container {

    private readonly slots: Slot[];
    private readonly itemIcons: Image[];
    private readonly itemAmountTexts: Text[];
    private readonly itemAmounts: number[];

    constructor(scene: Scene, x?: number, y?: number) {
        super(scene, 500, 500);

        this.slots = [];
        this.itemIcons = [];
        this.itemAmountTexts = [];
        this.itemAmounts = [];

        for(let i = 0; i < INVENTORY_SIZE; i++) {
            this.createSlot(i);
            this.createItemIcon(i);
            this.createItemAmountText(i);
            this.itemAmounts.push(0);
        }

        this.add(this.slots);
        this.add(this.itemIcons);
        this.add(this.itemAmountTexts);
    }

    public putItem(id: number, slot: number, amount: number) {
        const oldAmount = this.itemAmounts[slot];

        let newAmount = oldAmount + amount;

        if (newAmount < 0) newAmount = 0;

        this.itemAmounts[slot] = newAmount;

        const itemIcon = this.itemIcons[slot];
        const itemAmountText = this.itemAmountTexts[slot];

        if (newAmount > 0) {
            const itemTextureInfo = itemTexture[id];

            itemIcon.visible = true;
            itemIcon.setTexture(itemTextureInfo.key);
            if (itemTextureInfo.frame) itemIcon.setFrame(itemTextureInfo.frame);

            itemAmountText.visible = newAmount != 1;
            itemAmountText.text = String(newAmount);
        } else {
            itemIcon.visible = false;
            itemAmountText.visible = false;
        }
    }

    private createSlot(index: number) {
        const slot = new Slot(this.scene);
        slot.x = 0;
        slot.y = 0 - index * (Slot.SIZE + 4);
        this.slots.push(slot);
        this.scene.add.existing(slot);
    }

    private createItemIcon(index: number) {
        const item = this.scene.add.image(this.slots[index].x, this.slots[index].y, "");
        item.visible = false;
        this.itemIcons.push(item);
    }

    private createItemAmountText(index: number) {
        const itemAmountText = this.scene.add.text(this.slots[index].x + Slot.SIZE / 3, this.slots[index].y + Slot.SIZE / 3, "", {
            fontSize: "12px",
            backgroundColor: "rgba(0,0,0,0.5)"
        });
        itemAmountText.setOrigin(0.5, 0.5);
        itemAmountText.visible = false;
        this.itemAmountTexts.push(itemAmountText);
    }
}
