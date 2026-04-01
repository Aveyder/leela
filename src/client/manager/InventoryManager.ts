import UIScene from "../scene/UIScene";
import { Image } from "../../resource/Image";
import { INVENTORY_SIZE } from "../../shared/Constants";
import { ITEM_QUALITY_COLOR, ItemDescriptor } from "../../resource/Item";
import { SlotSpec } from "../../entity/component/InventorySpec";
import Inventory from "../../shared/Inventory";
import GameContext from "../GameContext";
import SwapItem from "../../entity/SwapItem";
import { Opcode } from "../../protocol/Opcode";
import Rectangle = Phaser.GameObjects.Rectangle;
import Clamp = Phaser.Math.Clamp;

type SlotContent = SlotSpec & {
  confirmed: boolean;
};

type Slot = {
  index: number;
  frame: Rectangle;
  icon: Phaser.GameObjects.Image;
  countText: Phaser.GameObjects.Text;
} & SlotContent;

export default class InventoryManager {

  private readonly COLUMNS = 8;
  private readonly ROWS = INVENTORY_SIZE / this.COLUMNS;

  private readonly SLOT_SIZE = 32;
  private readonly SLOT_GAP = 4;
  private readonly OVERLAY_PADDING = 4;
  private readonly ICON_PADDING = 2;
  private readonly TOOLTIP_PADDING = 6;
  private readonly TOOLTIP_DESCRIPTION_MARGIN_TOP = 2;
  private readonly TOOLTIP_WIDTH = 180;
  private readonly TOOLTIP_OFFSET = 2;

  private readonly context: GameContext;
  private readonly add: Phaser.GameObjects.GameObjectFactory;
  private readonly scale: Phaser.Scale.ScaleManager;

  private container!: Phaser.GameObjects.Container;

  private readonly slots: Slot[] = [];

  private draggedIcon!: Phaser.GameObjects.Image;
  private draggedSlot: Slot;
  private hoveredSlot: Slot;

  private tooltip!: Phaser.GameObjects.Container;
  private tooltipBackground!: Rectangle;
  private tooltipTitle!: Phaser.GameObjects.Text;
  private tooltipDescription!: Phaser.GameObjects.Text;

  constructor(private scene: UIScene) {
    this.context = scene.context;
    this.add = scene.add;
    this.scale = scene.scale;

    this.draggedSlot = null;
    this.hoveredSlot = null;

    this.init();
  }

  private init() {
    this.createView();

    this.scene.input.on("pointermove", this.onPointerMove, this);
    this.scene.input.on("pointerup", this.onPointerUp, this);

    this.scene.events.once("shutdown", this.destroy, this);

    this.hide();
  }

  public show(): void {
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
    this.hideTooltip();
  }

  public toggle(): void {
    if (this.container.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public setSlotContent(index: number, content: Partial<SlotContent>): void {
    const { count = 0, item = null, confirmed = false } = content;

    const slot = this.slots[index];

    if (slot === this.draggedSlot) {
      this.stopDragging();
    }

    if (count > 0 && item) {
      slot.item = item;
      slot.count = Clamp(count, 0, item.stackSize);

      const { icon, countText } = slot;

      this.setItemIcon(icon, item);

      if (count > 1) {
        countText.setText(`${count}`);
      } else {
        countText.setVisible(false);
      }
      this.showSlotContent(slot);
    } else {
      this.clearSlot(slot);
    }

    if (confirmed) {
      this.markSlotConfirmed(index);
    } else {
      this.markSlotPending(index);
    }
  };

  public markSlotConfirmed(index: number): void {
    const slot = this.slots[index];

    slot.confirmed = true;

    const { icon, item } = slot;

    if (item) {
      icon.setAlpha(1);
    }
  }

  private createView() {
    const width = this.scale.width;
    const height = this.scale.height;

    const gridWidth = this.COLUMNS * this.SLOT_SIZE + (this.COLUMNS - 1) * this.SLOT_GAP;
    const gridHeight = this.ROWS * this.SLOT_SIZE + (this.ROWS - 1) * this.SLOT_GAP;

    const startX = -gridWidth / 2 + this.SLOT_SIZE / 2;
    const startY = -gridHeight / 2 + this.SLOT_SIZE / 2;

    this.container = this.add.container(
      (width - gridWidth / 2 - this.OVERLAY_PADDING),
      (height - gridHeight / 2 - this.OVERLAY_PADDING)
    );

    const overlay = new Rectangle(
      this.scene,
      0, 0, gridWidth + this.OVERLAY_PADDING * 2, gridHeight + this.OVERLAY_PADDING * 2,
      0x000000, 0.8
    );

    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLUMNS; col++) {
        const slot = {
          index: row * this.COLUMNS + col
        } as Slot;

        const x = startX + col * (this.SLOT_SIZE + this.SLOT_GAP);
        const y = startY + row * (this.SLOT_SIZE + this.SLOT_GAP);

        const frame = this.add.rectangle(
          x, y, this.SLOT_SIZE, this.SLOT_SIZE, 0x2b2b2b, 0.25
        ).setStrokeStyle(2, 0x8a8a8a, 1);

        frame.setInteractive({useHandCursor: true});
        frame.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.onSlotPointerDown(slot, pointer));
        frame.on("pointerover", (pointer: Phaser.Input.Pointer) => this.onSlotPointerOver(slot, pointer));
        frame.on("pointerout", () => this.onSlotPointerOut());

        const icon = this.add.image(x, y, Image.PLACEHOLDER)
          .setVisible(false);

        const count = this.add.text(
          x + this.SLOT_SIZE / 2,
          y + this.SLOT_SIZE / 2,
          "",
          {
            fontSize: "10px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2
          }
        ).setOrigin(1, 1)
          .setVisible(false);

        Object.assign(slot, {
          frame,
          icon,
          countText: count,
          count: -1,
          item: null
        });

        this.slots.push(slot);
      }
    }

    this.draggedIcon = this.add.image(0, 0, Image.PLACEHOLDER)
      .setVisible(false);

    this.tooltipBackground = this.add.rectangle(0, 0, 0, 0, 0x000000, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x555555, 1);

    this.tooltipTitle = this.add.text(0, 0, "", {
      fontSize: "12px",
      fontStyle: "bold",
      color: "#ffffff"
    }).setOrigin(0, 0);

    this.tooltipDescription = this.add.text(0, 0, "", {
      fontSize: "11px",
      color: "#d9d9d9",
    }).setOrigin(0, 0);

    this.tooltip = this.add.container(0, 0, [
      this.tooltipBackground,
      this.tooltipTitle,
      this.tooltipDescription
    ]).setVisible(false).setDepth(1_000);

    this.container.add(overlay);
    this.container.add(this.slots.flatMap((slot) => [slot.frame, slot.icon, slot.countText]));
    this.container.add(this.draggedIcon);
  }

  private onSlotPointerOver(slot: Slot, pointer: Phaser.Input.Pointer): void {
    if (!this.container.visible) {
      return;
    }

    this.hoveredSlot = slot;

    if (this.draggedSlot === null) {
      this.showTooltip(this.hoveredSlot.item, pointer);
    }
  }

  private onSlotPointerDown(slot: Slot, pointer: Phaser.Input.Pointer): void {
    if (!this.container.visible) {
      return;
    }

    if (this.draggedSlot !== null) {
      return;
    }

    if (!slot.item || !slot.confirmed) {
      return;
    }
    this.hideTooltip();
    this.hideSlotContent(slot);

    this.draggedSlot = slot;

    this.draggedIcon.setVisible(true);
    this.setItemIcon(this.draggedIcon, slot.item);
    this.updateDraggedIconPosition(pointer);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.container.visible) {
      return;
    }

    if (this.draggedSlot !== null) {
      this.updateDraggedIconPosition(pointer);
    } else {
      this.updateTooltipPosition(pointer);
    }
  }

  private onSlotPointerOut(): void {
    this.hoveredSlot = null;
    this.hideTooltip();
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.container.visible) {
      return;
    }
    if (this.draggedSlot === null) {
      return;
    }

    let isDropAllowed = this.hoveredSlot !== null &&
      this.hoveredSlot.confirmed &&
      this.draggedSlot !== this.hoveredSlot;

    if (isDropAllowed) {
      this.swapSlots(this.draggedSlot, this.hoveredSlot);
    } else {
      this.showSlotContent(this.draggedSlot);
    }

    this.showTooltip(this.hoveredSlot.item, pointer);

    this.stopDragging();
  }

  private stopDragging(): void {
    this.draggedSlot = null;
    this.draggedIcon.setVisible(false);
  }

  private updateDraggedIconPosition(pointer: Phaser.Input.Pointer): void {
    this.draggedIcon.setPosition(
      pointer.worldX - this.container.x,
      pointer.worldY - this.container.y
    );
  }

  private updateTooltipPosition(pointer: Phaser.Input.Pointer): void {
    const tooltipWidth = this.tooltipBackground.width;
    const tooltipHeight = this.tooltipBackground.height;

    let x = pointer.worldX + this.TOOLTIP_OFFSET;
    let y = pointer.worldY - tooltipHeight - this.TOOLTIP_OFFSET;

    if (x + tooltipWidth > this.scale.width) {
      x = pointer.worldX - tooltipWidth - this.TOOLTIP_OFFSET;
    }

    if (y < 0) {
      y = pointer.worldY + this.TOOLTIP_OFFSET;
    }

    this.tooltip.setPosition(x, y);
  }

  private setItemIcon(icon: Phaser.GameObjects.Image, item: ItemDescriptor): void {
    icon.setTexture(item.imageKey, item.asset);
    icon.setDisplaySize(this.SLOT_SIZE - this.ICON_PADDING * 2, this.SLOT_SIZE - this.ICON_PADDING * 2);
  }

  private swapSlots(srcSlot: Slot, destSlot: Slot): void {
    const { src, dest } = Inventory.swapSlots(srcSlot, destSlot);

    this.setSlotContent(srcSlot.index, src);
    this.setSlotContent(destSlot.index, dest);

    this.context.session.sendObject<SwapItem>(Opcode.CMSG_SWAP_ITEM, {
      src: srcSlot.index,
      dest: destSlot.index
    });
  }

  private markSlotPending(index: number): void {
    const slot = this.slots[index];

    slot.confirmed = false;

    const { icon, item } = slot;

    if (item) {
      icon.setAlpha(0.5);
    }
  }

  private showSlotContent(slot: Slot): void {
    const { icon, countText } = slot;

    icon.setVisible(true);
    countText.setVisible(true);
  }

  private hideSlotContent(slot: Slot): void {
    const { icon, countText } = slot;

    icon.setVisible(false);
    countText.setVisible(false);
  }

  private clearSlot(slot: Slot): void {
    slot.item = null;
    slot.count = -1;

    this.hideSlotContent(slot);
  }

  private showTooltip(item: ItemDescriptor, pointer: Phaser.Input.Pointer): void {
    if (!item) {
      return;
    }
    this.setTooltipItem(item);
    this.updateTooltipPosition(pointer);
  }

  private setTooltipItem(item: ItemDescriptor) {
    this.tooltipTitle.setText(item.name);
    this.tooltipTitle.setColor(ITEM_QUALITY_COLOR[item.quality]);

    this.tooltipDescription
      .setWordWrapWidth(this.TOOLTIP_WIDTH, true)
      .setText(item.description);

    this.tooltipTitle.setPosition(this.TOOLTIP_PADDING, this.TOOLTIP_PADDING);
    this.tooltipDescription.setPosition(
      this.TOOLTIP_PADDING,
      this.TOOLTIP_PADDING + this.tooltipTitle.height + this.TOOLTIP_DESCRIPTION_MARGIN_TOP
    );

    const textWidth = Math.max(this.tooltipTitle.width, this.tooltipDescription.width);
    const tooltipWidth = textWidth + this.TOOLTIP_PADDING * 2;
    const tooltipHeight = this.tooltipDescription.y + this.tooltipDescription.height + this.TOOLTIP_PADDING;

    this.tooltipBackground.setSize(tooltipWidth, tooltipHeight);
    this.tooltip.setVisible(true);
  }

  private hideTooltip(): void {
    this.tooltip.setVisible(false);
  }

  private destroy(): void {
    this.scene.input.off("pointermove", this.onPointerMove, this);
    this.scene.input.off("pointerup", this.onPointerUp, this);
  }
}
