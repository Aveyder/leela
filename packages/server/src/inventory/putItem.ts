import Item, {itemData} from "../entities/Item";
import {Opcode} from "@leela/common";
import Player from "../player/Player";

function putItemToInventory(player: Player, id: number, stack: number) {
    if (!id) return;

    if (stack <= 0) return;

    let putStack = stack;

    const maxStack = itemData[id].maxStack;

    const worldSession = player.worldSession;

    for(let slot = 0; slot < player.inventory.length && putStack != 0; slot++) {
        let itemInSlot = player.inventory[slot];

        if (!itemInSlot) {
            itemInSlot = player.inventory[slot] = new Item(id, 0);
        }

        if (itemInSlot.id == id) {
            const putSlotStack = Math.min(maxStack - itemInSlot.stack, putStack);

            itemInSlot.stack += putSlotStack;

            putStack -= putSlotStack;

            if (putSlotStack != 0) {
                worldSession.sendPacket([Opcode.SMSG_PUT_ITEM, slot, id, putSlotStack]);
            }
        }
    }

    return putStack;
}

export {
    putItemToInventory
}