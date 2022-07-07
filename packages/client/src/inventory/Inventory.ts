import Image = Phaser.GameObjects.Image;
import Container = Phaser.GameObjects.Container;
import Text = Phaser.GameObjects.Text;
import Graphics = Phaser.GameObjects.Graphics;
import {Scene} from "phaser";
import {INVENTORY_SIZE, TMP_VEC2} from "@leela/common";
import Item, {itemTexture} from "../core/Item";

export default class Inventory extends Container {

    private static readonly SLOT_SIZE = 32;
    private static readonly SLOT_MARGIN = 4;

    private readonly _items: Item[];

    private slots: Graphics;
    private readonly itemIcons: Image[];
    private readonly itemStackTexts: Text[];
    private _gold: number;
    private goldIcon: Image;
    private goldText: Text;

    constructor(scene: Scene, x?: number, y?: number) {
        super(scene, x, y);

        this.createSlots();

        this._items = [];
        this.itemIcons = [];
        this.itemStackTexts = [];

        for(let i = 0; i < INVENTORY_SIZE; i++) {
            this._items.push(null);
            this.createItemIcon(i);
            this.createItemStackText(i);
        }

        this._gold = 0;
        this.createGoldCounter();

        this.drawSlots();
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
        this.drawSlots();
    }

    public get items() {
        return this._items;
    }

    public putGold(amount: number) {
        this._gold += amount;

        this.goldText.text = String(this._gold);
    }

    public get gold() {
        return this._gold;
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

    private drawSlots() {
        this.slots.clear();

        for(let i = 0; i < this._items.length; i++) {
            const pos =  this.getSlotPosition(i);

            const item = this._items[i];

            this.slots.fillStyle(item ? 0x1E1E1E : 0x313131, 0.95);
            this.slots.fillRect(pos.x - Inventory.SLOT_SIZE / 2, pos.y - Inventory.SLOT_SIZE / 2, Inventory.SLOT_SIZE, Inventory.SLOT_SIZE);

            this.slots.lineStyle(1, 0x000000, 0.85);
            this.slots.strokeRect(pos.x - Inventory.SLOT_SIZE / 2 + 1, pos.y - Inventory.SLOT_SIZE / 2 + 1, Inventory.SLOT_SIZE - 2, Inventory.SLOT_SIZE - 2);

            this.slots.lineStyle(1, 0xEAEAEA);
            this.slots.strokeRect(pos.x - Inventory.SLOT_SIZE / 2, pos.y - Inventory.SLOT_SIZE / 2, Inventory.SLOT_SIZE,  Inventory.SLOT_SIZE);
        }
    }

    private createItemIcon(index: number) {
        const pos = this.getSlotPosition(index);

        const itemIcon = new Image(this.scene, pos.x, pos.y, "");
        itemIcon.visible = false;

        this.itemIcons.push(itemIcon);

        this.add(itemIcon);
    }

    private createItemStackText(index: number) {
        const pos = this.getSlotPosition(index);

        const itemStackText = new Text(this.scene, pos.x + Inventory.SLOT_SIZE / 3 + 4, pos.y + Inventory.SLOT_SIZE / 3 - 2, "", {
            fontSize: "12px",
            backgroundColor: "rgba(0,0,0,0.5)"
        });
        itemStackText.setOrigin(1, 0.5);
        itemStackText.visible = false;

        this.itemStackTexts.push(itemStackText);

        this.add(itemStackText);
    }

    private createGoldCounter() {
        this.goldIcon = new Image(this.scene, Inventory.SLOT_SIZE / 2 - 4, 0, "rpg-items", 89);
        this.goldText = new Text(this.scene, 4, 0, `${this._gold}`, {
            fontSize: "12px",
            backgroundColor: "rgba(0,0,0,0.5)"
        });
        this.goldText.setOrigin(1, 0.5);

        this.add(this.goldIcon);
        this.add(this.goldText);
    }

    private createSlots() {
        this.slots = new Graphics(this.scene);

        this.add(this.slots);
    }

    private getSlotPosition(index: number) {
        const pos = TMP_VEC2;

        pos.x = 0;
        pos.y = 0 - index * (Inventory.SLOT_SIZE + Inventory.SLOT_MARGIN) - 25;

        return pos;
    }
}
