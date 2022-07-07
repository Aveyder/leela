import WorldSession from "../client/WorldSession";
import {Role, Type, Update, WorldPacket} from "@leela/common";
import Unit, {addUnitToWorld, deleteUnitFromWorld, hasRole, isPlayer, Snapshot} from "./Unit";
import {reconcilePlayerPosition, resetPrediction} from "../player/prediction";
import {CLIENT_PREDICT, INTERPOLATE, INTERPOLATE_BUFFER_SIZE, INTERPOLATE_DROP_DUPLICATES} from "../config";
import {equals} from "../utils/vec2";
import {getPlayerState, initPlayerState} from "../player/PlayerState";
import Plant, {addPlantToWorld, deletePlantFromWorld} from "../plant/Plant";
import Item from "./Item";
import {initNpcState} from "../npc/NpcState";

type ObjectUpdate = {
    update: Update,
    guid: number,
    typeId: number,
    x: number,
    y: number
}

interface UnitUpdate extends ObjectUpdate {
    update: Update,
    guid: number,
    typeId: number,
    roles: number[],
    skin: number,
    x: number,
    y: number,
    vx: number,
    vy: number
}

interface PlayerUpdate extends UnitUpdate {
    update: Update,
    guid: number,
    typeId: number,
    roles: number[],
    skin: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    ackTick: number,
    speed: number,
    inventory: Item[],
    gold: number
}

interface PlantUpdate extends ObjectUpdate {
    update: Update,
    guid: number,
    typeId: number,
    x: number,
    y: number,
    kind: number
}

function handleUpdate(worldSession: WorldSession, worldPacket: WorldPacket) {
    worldPacket.shift(); // opcode
    const timestamp = worldPacket.shift() as number;

    const objectUpdates = deserializeObjectUpdates(worldSession, worldPacket);

    objectUpdates.forEach(objectUpdate => {
        if (objectUpdate.typeId == Type.PLANT) {
            handlePlantUpdate(worldSession, objectUpdate as PlantUpdate);
        } else {
            handleUnitUpdate(worldSession, timestamp, objectUpdate as UnitUpdate);
        }
    });
}

function deserializeObjectUpdates(worldSession: WorldSession, input: unknown[]): ObjectUpdate[] {
    const objectUpdates = [];

    for (let i = 0; i < input.length;) {
        const update = input[i];
        const guid = input[i + 1];
        const typeId = input[i + 2];

        let objectUpdate;
        switch (update) {
            case Update.FULL:
                if (typeId == Type.PLANT) {
                    objectUpdate = deserializeFullPlantUpdate(i + 1, input);
                    i += 6;
                } else {
                    if (worldSession.playerGuid == guid) {
                        objectUpdate = deserializeFullPlayerUpdate(i + 1, input);
                        i += 4;
                    } else {
                        objectUpdate = deserializeFullUnitUpdate(i + 1, input);
                    }
                    i += 9;
                }
                break;
            case Update.EMPTY:
                objectUpdate = deserializeEmptyUnitUpdate(i + 1, input);
                i += 2;
                break;
            case Update.UNIT_SKIN:
                objectUpdate = deserializeSkinUnitUpdate(i + 1, input);
                i += 3;
                break;
            case Update.UNIT_POSITION:
                if (worldSession.playerGuid == guid) {
                    objectUpdate = deserializePositionPlayerUpdate(i + 1, input);
                    i += 2;
                } else {
                    objectUpdate = deserializePositionUnitUpdate(i + 1, input);
                }
                i += 6;
                break;
        }

        objectUpdate.update = update;
        objectUpdates.push(objectUpdate);
    }

    return objectUpdates;
}

function deserializeFullPlantUpdate(index: number, serialized: unknown[]) {
    return {
        guid: serialized[index] as number,
        typeId: serialized[index + 1] as number,
        x: serialized[index + 2] as number,
        y: serialized[index + 3] as number,
        kind: serialized[index + 4] as number,
    } as PlantUpdate;
}

function deserializeFullPlayerUpdate(index: number, serialized: unknown[]) {
    const playerUpdate = deserializeFullUnitUpdate(index, serialized) as PlayerUpdate;
    playerUpdate.ackTick = serialized[index + 8] as number;
    playerUpdate.speed = serialized[index + 9] as number;
    playerUpdate.inventory = deserializeInventoryUpdate(serialized[index + 10] as number[]);
    playerUpdate.gold = serialized[index + 11] as number;
    return playerUpdate;
}

function deserializeFullUnitUpdate(index: number, serialized: unknown[]) {
    return {
        guid: serialized[index] as number,
        typeId: serialized[index + 1] as number,
        roles: serialized[index + 2] as number[],
        skin: serialized[index + 3] as number,
        x: serialized[index + 4] as number,
        y: serialized[index + 5] as number,
        vx: serialized[index + 6] as number,
        vy: serialized[index + 7] as number
    } as UnitUpdate;
}

function deserializeInventoryUpdate(serialized: number[]) {
    const inventory = [] as Item[];
    for(let i = 0; i < serialized.length; i++) {
        const id = serialized[i];
        if (id) {
            inventory.push({id, stack: serialized[i + 1]});
            i += 1;
        } else {
            inventory.push(null);
        }
    }
    return inventory;
}

function deserializeEmptyUnitUpdate(index: number, serialized: unknown[]) {
    return {
        guid: serialized[index] as number
    } as UnitUpdate;
}

function deserializeSkinUnitUpdate(index: number, serialized: unknown[]) {
    return {
        guid: serialized[index] as number,
        skin: serialized[index + 1] as number,
    } as UnitUpdate;
}

function deserializePositionPlayerUpdate(index: number, serialized: unknown[]) {
    const playerUpdate = deserializePositionUnitUpdate(index, serialized) as PlayerUpdate;
    playerUpdate.ackTick = serialized[index + 5] as number;
    playerUpdate.speed = serialized[index + 6] as number;
    return playerUpdate;
}

function deserializePositionUnitUpdate(index: number, serialized: unknown[]) {
    return {
        guid: serialized[index] as number,
        x: serialized[index + 1] as number,
        y: serialized[index + 2] as number,
        vx: serialized[index + 3] as number,
        vy: serialized[index + 4] as number
    } as UnitUpdate;
}

function handlePlantUpdate(worldSession: WorldSession, plantUpdate: PlantUpdate) {
    const worldScene = worldSession.worldScene;

    const plant = new Plant(worldScene, plantUpdate.kind, plantUpdate.x, plantUpdate.y);

    plant.guid = plantUpdate.guid;
    plant.typeId = plantUpdate.typeId;

    plant.setInteractive();

    addPlantToWorld(plant);
}

function handleUnitUpdate(worldSession: WorldSession, timestamp: number, unitUpdate: UnitUpdate) {
    const worldScene = worldSession.worldScene;

    let unit = worldScene.units[unitUpdate.guid] as Unit;

    const update = unitUpdate.update;

    switch (update) {
        case Update.EMPTY:
            cloneLastSnapshotState(unitUpdate, unit);
            pushToUnitSnapshots(unit, unitUpdate, timestamp);
            return;
        case Update.UNIT_SKIN:
            unit.skin = unitUpdate.skin;
            return;
        case Update.FULL:
            if (!unit) unit = initUnit(worldSession, unitUpdate);
            unit.skin = unitUpdate.skin;

            if (isPlayer(unit)) handleFullInventoryUpdate(unit, unitUpdate as PlayerUpdate);
            break;
        case Update.UNIT_POSITION:
            break;
    }

    handlePositionUpdate(unit, unitUpdate, timestamp);
}

function initUnit(worldSession: WorldSession, unitUpdateState: UnitUpdate) {
    const worldScene = worldSession.worldScene;

    const unit = new Unit(worldScene);

    unit.guid = unitUpdateState.guid;
    unit.typeId = unitUpdateState.typeId;
    unit.setPosition(unitUpdateState.x, unitUpdateState.y);

    if (isPlayer(unit)) {
        const player = unit;

        worldSession.player = player;

        initPlayerState(player).draw();

        resetPrediction(unit);
    }

    if (unit.typeId == Type.MOB) {
        const npc = unit;

        const npcState = initNpcState(npc);

        npcState.roles = unitUpdateState.roles;

        if (hasRole(npc, Role.VENDOR)) npc.setInteractive();
    }

    addUnitToWorld(unit);

    return unit;
}

function handleFullInventoryUpdate(player: Unit, playerUpdate: PlayerUpdate) {
    const inventory = getPlayerState(player).inventory;

    for(let slot = 0; slot < playerUpdate.inventory.length; slot++) {
        inventory.putItem(slot, playerUpdate.inventory[slot]);
    }

    inventory.putGold(playerUpdate.gold);
}

function handlePositionUpdate(unit: Unit, unitUpdate: UnitUpdate, timestamp: number) {
    pushToUnitSnapshots(unit, unitUpdate, timestamp);

    if (isPlayer(unit)) {
        const player = unit;
        const playerUpdate = unitUpdate as PlayerUpdate;

        const playerState = getPlayerState(player);

        playerState.speed = playerUpdate.speed;

        if (CLIENT_PREDICT) reconcilePlayerPosition(player, playerUpdate, playerUpdate.ackTick);
    }

    if (!INTERPOLATE) {
        unit.setPosition(unitUpdate.x, unitUpdate.y);
        unit.setDir(unitUpdate.vx, unitUpdate.vy);
    }
}

function cloneLastSnapshotState(unitUpdate: UnitUpdate, unit: Unit) {
    const snapshots = unit.snapshots;

    const lastSnapshotState = snapshots[snapshots.length - 1].state;

    unitUpdate.x = lastSnapshotState.x;
    unitUpdate.y = lastSnapshotState.y;
    unitUpdate.vx = lastSnapshotState.vx;
    unitUpdate.vy = lastSnapshotState.vy;
}

function pushToUnitSnapshots(unit: Unit, unitUpdate: UnitUpdate, timestamp: number) {
    const snapshots = unit.snapshots;

    trimStateBuffer(snapshots);

    if (INTERPOLATE_DROP_DUPLICATES) {
        deduplicateUnitSnapshots(snapshots, unitUpdate);
    }

    snapshots.push({state: unitUpdate, timestamp});
}

function trimStateBuffer(snapshots: Snapshot[]) {
    if (snapshots.length > INTERPOLATE_BUFFER_SIZE) snapshots.splice(0, 1);
}

function deduplicateUnitSnapshots(snapshots: Snapshot[], unitUpdate: UnitUpdate) {
    if (snapshots.length > 2) {
        const lastIndex = snapshots.length - 1;
        const last = snapshots[lastIndex];
        if (!equals(unitUpdate, last.state)) {
            let count = 1;
            for(let i = lastIndex - 1; i >= 0; i--) {
                const cur = snapshots[i];
                if (equals(cur.state, last.state)) {
                    if (count < INTERPOLATE_DROP_DUPLICATES) {
                        count++;
                    } else {
                        break;
                    }
                } else {
                    if (count > 1) {
                        snapshots.splice(i + 2);
                    }
                    break;
                }
            }
        }
    }
}

function handleDestroy(worldSession: WorldSession, worldPacket: WorldPacket) {
    const worldScene = worldSession.worldScene;

    const guid = worldPacket[1] as number;

    const unit = worldScene.units[guid];
    if (unit) handleUnitDestroy(worldSession, unit);

    const plant = worldScene.plants[guid] as Plant;
    if (plant) deletePlantFromWorld(plant);
}

function handleUnitDestroy(worldSession: WorldSession, unit: Unit) {
    const worldScene = worldSession.worldScene;

    if (isPlayer(unit)) {
        worldSession.playerGuid = null;
        worldSession.player = null;
        worldScene.gameMenu.showJoinMenu();
    }

    deleteUnitFromWorld(unit);
}

export {
    UnitUpdate,
    PlayerUpdate,
    handleUpdate,
    handleDestroy
}