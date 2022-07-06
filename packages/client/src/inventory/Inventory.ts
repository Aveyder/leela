import Image = Phaser.GameObjects.Image;
import Container = Phaser.GameObjects.Container;
import Text = Phaser.GameObjects.Text;
import {Scene} from "phaser";
import {INVENTORY_SIZE} from "@leela/common";
import Slot from "./Slot";
import Item, {itemTexture} from "../entities/Item";

export default class Inventory extends Container {

    private readonly slots: Slot[];
    private readonly itemIcons: Image[];
    private readonly itemStackTexts: Text[];

    private readonly _items: Item[];

    constructor(scene: Scene, x?: number, y?: number) {
        super(scene, x, y);

        this.slots = [];
        this.itemIcons = [];
        this.itemStackTexts = [];

        this._items = [];

        for(let i = 0; i < INVENTORY_SIZE; i++) {
            this.createSlot(i);
            this.createItemIcon(i);
            this.createItemStackText(i);

            this._items.push(null);
        }
    }

    public putItem(slot: number, item: Item) {
        const itemInSlot = this._items[slot];

        if (itemInSlot) {
            itemInSlot.id = item.id;
            itemInSlot.stack += item.stack;

            if (itemInSlot.stack == 0) this._items[slot] = null;
        } else {
            this._items[slot] = item;
        }

        this.drawItems();
    }

    public get items() {
        return this._items;
    }

    private drawItems() {
        for (let slot = 0; slot < this._items.length; slot++) {
            const item = this._items[slot];

            const itemIcon = this.itemIcons[slot];
            const itemAmountText = this.itemStackTexts[slot];
            if (item) {
                const itemTextureInfo = itemTexture[item.id];

                itemIcon.visible = true;
                itemIcon.setTexture(itemTextureInfo.key);
                if (itemTextureInfo.frame) itemIcon.setFrame(itemTextureInfo.frame);

                itemAmountText.visible = item.stack != 1;
                itemAmountText.text = String(item.stack);
            } else {
                itemIcon.visible = false;
                itemAmountText.visible = false;
            }
        }
    }

    private createSlot(index: number) {
        const slot = new Slot(this.scene);
        slot.x = 0;
        slot.y = 0 - index * (Slot.SIZE + 4);
        this.slots.push(slot);

        this.add(slot);
    }

    private createItemIcon(index: number) {
        const itemIcon = new Image(this.scene, this.slots[index].x, this.slots[index].y, "");
        itemIcon.visible = false;
        this.itemIcons.push(itemIcon);

        this.add(itemIcon);
    }

    private createItemStackText(index: number) {
        const itemStackText = new Text(this.scene, this.slots[index].x + Slot.SIZE / 3, this.slots[index].y + Slot.SIZE / 3, "", {
            fontSize: "12px",
            backgroundColor: "rgba(0,0,0,0.5)"
        });
        itemStackText.setOrigin(0.5, 0.5);
        itemStackText.visible = false;
        this.itemStackTexts.push(itemStackText);

        this.add(itemStackText);
    }
}
