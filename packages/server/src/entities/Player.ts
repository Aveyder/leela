import WorldSession from "../server/WorldSession";
import {Unit} from "./Unit";
import {
    FRACTION_DIGITS,
    GATHER_DURATION,
    INVENTORY_SIZE,
    Opcode,
    Role,
    toFixed,
    Type,
    UNIT_BODY_HEIGHT,
    UNIT_BODY_WIDTH,
    Update,
    WorldPacket
} from "@leela/common";
import {cloneObject, deleteObjectFromWorld, isInWorld} from "./GameObject";
import Plant, {plantToItem} from "./Plant";
import Item, {itemData} from "./Item";
import World from "../world/World";

export default class Player implements Unit {
    public guid: number;
    public readonly typeId: number;
    public readonly roles: Role[];
    public skin: number;
    public x: number;
    public y: number;
    public vx: number;
    public vy: number
    public readonly width: number;
    public readonly height: number;
    public readonly bullet: boolean;
    public tick: number;
    public speed: number;
    public run: boolean;
    public readonly inventory: Item[];
    public gathering: Plant;
    public gatheringTimer: number;

    private readonly _worldSession: WorldSession;

    constructor(worldSession: WorldSession) {
        this._worldSession = worldSession;

        this.typeId = Type.PLAYER;
        this.roles = null;
        this.width = UNIT_BODY_WIDTH;
        this.height = UNIT_BODY_HEIGHT;
        this.bullet = false;
        this.run = true;
        this.inventory = [];
        resetGathering(this);
        for(let i = 0; i < INVENTORY_SIZE; i++) this.inventory.push(null);
    }

    public get worldSession() {
        return this._worldSession;
    }

    public get world() {
        return this._worldSession.world;
    }
}

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
        toFixed(unit.x, FRACTION_DIGITS),
        toFixed(unit.y, FRACTION_DIGITS),
        toFixed(unit.vx, FRACTION_DIGITS),
        toFixed(unit.vy, FRACTION_DIGITS)
    );
}

function pushSerializedFullPlayerUpdate(player: Player, unitUpdates: unknown[]) {
    pushSerializedPositionPlayerUpdate(player, unitUpdates);
    pushSerializedInventoryUpdate(player, unitUpdates);
}

function pushSerializedInventoryUpdate(player: Player, unitUpdates: unknown[]) {
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

function updatePlayers(world: World, delta: number) {
    Object.values(world.units)
        .filter(unit => unit.typeId == Type.PLAYER)
        .forEach((player: Player) => updatePlayer(player, delta));
}

function updatePlayer(player: Player, delta: number) {
    updateGathering(player, delta);
}

function updateGathering(player: Player, delta: number) {
    const plant = player.gathering;

    if (plant) {
        player.gatheringTimer += delta;

        const worldSession = player.worldSession;

        if (!isInWorld(plant)) {
            resetGathering(player);
            worldSession.sendPacket([Opcode.SMSG_GATHER_FAIL, plant.guid]);
            return;
        }

        if (player.gatheringTimer >= GATHER_DURATION) {
            resetGathering(player);
            const leftStack = putItemToInventory(player, plantToItem[plant.kind], 1);

            if (leftStack == 0) {
                deleteObjectFromWorld(plant);
                worldSession.sendPacket([Opcode.SMSG_GATHER_SUCCESS, plant.guid]);
            } else {
                worldSession.sendPacket([Opcode.SMSG_GATHER_FAIL, plant.guid]);
            }
        }
    }
}

function resetGathering(player: Player) {
    player.gathering = null;
    player.gatheringTimer = 0;
}

export {
    sendUpdateToPlayer,
    putItemToInventory,
    updatePlayers,
    resetGathering
}
