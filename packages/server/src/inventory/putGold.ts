import {Opcode} from "@leela/common";
import Player from "../player/Player";

function putGoldToInventory(player: Player, amount: number) {
    player.gold += amount;

    const worldSession = player.worldSession;
    worldSession.sendPacket([Opcode.SMSG_PUT_GOLD, amount]);
}

export {
    putGoldToInventory
}