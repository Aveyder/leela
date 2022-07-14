import WorldSession from "../server/WorldSession";
import {FRACTION_DIGITS, Opcode, toFixed, Update, WorldPacket} from "@leela/common";
import {Unit} from "./Unit";
import {cloneObject} from "./GameObject";
import Plant from "../plant/Plant";
import Player from "../player/Player";

function sendUpdateToPlayer(worldSession: WorldSession) {
    const units = worldSession.world.units;
    const serializedUnitUpdates = [];
    Object.values(units).forEach(unit => pushSerializedUnitUpdate(worldSession, unit, serializedUnitUpdates));

    const plants = worldSession.world.plants;
    const serializedPlantUpdates = [];
    Object.values(plants).forEach(plant => pushSerializedPlantUpdate(worldSession, plant, serializedPlantUpdates));

    if (serializedUnitUpdates.length) {
        const packet = [
            Opcode.SMSG_UPDATE,
            Date.now(),
            ...serializedUnitUpdates,
            ...serializedPlantUpdates
        ] as WorldPacket;

        worldSession.sendPacket(packet);
    }
}

function pushSerializedUnitUpdate(worldSession: WorldSession, unit: Unit, unitUpdates: unknown[]) {
    const lastSentUnitUpdate = worldSession.lastSentUpdate[unit.guid] as Unit;

    if (!lastSentUnitUpdate) {
        pushSerializedFullUnitUpdate(unit, unitUpdates);
        if (worldSession.player == unit) {
            pushSerializedFullPlayerUpdate(unit as Player, unitUpdates);
        }
    } else {
        if (lastSentUnitUpdate.skin != unit.skin) {
            pushSerializedSkinUnitUpdate(unit, unitUpdates);
        }
        if (lastSentUnitUpdate.x != unit.x ||
            lastSentUnitUpdate.y != unit.y ||
            lastSentUnitUpdate.vx != unit.vx ||
            lastSentUnitUpdate.vy != unit.vy) {
            pushSerializedPositionUnitUpdate(unit, unitUpdates);
            if (worldSession.player == unit) {
                pushSerializedPositionPlayerUpdate(unit as Player, unitUpdates);
            }
        } else {
            pushSerializedEmptyUnitUpdate(unit, unitUpdates);
        }
    }

    worldSession.lastSentUpdate[unit.guid] = cloneObject(unit, lastSentUnitUpdate) as Unit;
}

function pushSerializedFullUnitUpdate(unit: Unit, unitUpdates: unknown[]) {
    unitUpdates.push(Update.FULL,
        unit.guid,
        unit.typeId,
        unit.roles,
        unit.skin,
        unit.name,
        toFixed(unit.x, FRACTION_DIGITS),
        toFixed(unit.y, FRACTION_DIGITS),
        toFixed(unit.vx, FRACTION_DIGITS),
        toFixed(unit.vy, FRACTION_DIGITS)
    );
}

function pushSerializedFullPlayerUpdate(player: Player, unitUpdates: unknown[]) {
    pushSerializedPositionPlayerUpdate(player, unitUpdates);
    pushSerializedFullInventoryUpdate(player, unitUpdates);
    unitUpdates.push(player.gold);
}

function pushSerializedFullInventoryUpdate(player: Player, unitUpdates: unknown[]) {
    const inventory = [];
    player.inventory.map(item => {
        if (item) {
            inventory.push(item.id, item.stack);
        } else {
            inventory.push(0);
        }
    });
    unitUpdates.push(inventory);
}

function pushSerializedSkinUnitUpdate(unit: Unit, unitUpdates: unknown[]) {
    unitUpdates.push(Update.UNIT_SKIN,
        unit.guid,
        unit.skin
    );
}

function pushSerializedPositionUnitUpdate(unit: Unit, unitUpdates: unknown[]) {
    unitUpdates.push(Update.UNIT_POSITION,
        unit.guid,
        toFixed(unit.x, FRACTION_DIGITS),
        toFixed(unit.y, FRACTION_DIGITS),
        toFixed(unit.vx, FRACTION_DIGITS),
        toFixed(unit.vy, FRACTION_DIGITS)
    );
}

function pushSerializedPositionPlayerUpdate(player: Player, unitUpdates: unknown[]) {
    unitUpdates.push(
        player.tick,
        player.speed
    );
}

function pushSerializedEmptyUnitUpdate(unit: Unit, unitUpdates: unknown[]) {
    unitUpdates.push(Update.EMPTY,
        unit.guid
    );
}

function pushSerializedPlantUpdate(worldSession: WorldSession, plant: Plant, plantUpdates: unknown[]) {
    const lastSentPlantUpdate = worldSession.lastSentUpdate[plant.guid] as Plant;

    if (!lastSentPlantUpdate) {
        plantUpdates.push(Update.FULL,
            plant.guid,
            plant.typeId,
            toFixed(plant.x, FRACTION_DIGITS),
            toFixed(plant.y, FRACTION_DIGITS),
            plant.kind
        )
    }

    worldSession.lastSentUpdate[plant.guid] = cloneObject(plant, lastSentPlantUpdate) as Plant;
}

export {
    sendUpdateToPlayer,
}