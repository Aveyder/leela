import WorldSession from "../client/WorldSession";
import {
    Role,
    Type,
    UNIT_BODY_HEIGHT,
    UNIT_BODY_WIDTH,
    updateDataSize,
    UpdateOpcode,
    Vec2,
    WorldPacket
} from "@leela/common";
import Unit, {addUnitToWorld, deleteUnitFromWorld, isPlayer, Snapshot, SnapshotState} from "./Unit";
import {reconcilePlayerPosition, resetPrediction} from "../player/prediction";
import {CLIENT_PREDICT, INTERPOLATE, INTERPOLATE_BUFFER_SIZE, INTERPOLATE_DROP_DUPLICATES} from "../config";
import {equals} from "../utils/vec2";
import {getPlayerState, initPlayerState, removePlayerFromWorldSession} from "../player/PlayerState";
import Plant, {addPlantToWorld, deletePlantFromWorld} from "../plant/Plant";
import {initNpcState} from "../npc/NpcState";
import Rectangle = Phaser.Geom.Rectangle;

const UPDATE_HEADERS_SIZE = 2;

interface UpdateHandler {
    (worldSession: WorldSession, timestamp: number, guid: number, data: unknown[]): void;
}

const updateHandlers: Record<UpdateOpcode, UpdateHandler> = {
    [UpdateOpcode.UNIT_NEW]: handleUnitNewUpdate,
    [UpdateOpcode.UNIT_ACK]: handleUnitAckUpdate,
    [UpdateOpcode.UNIT_SKIN]: handleUnitSkinUpdate,
    [UpdateOpcode.UNIT_POS]: handleUnitPositionUpdate,
    [UpdateOpcode.PLAYER_ACK]: handlePlayerAckUpdate,
    [UpdateOpcode.PLAYER_SPEED]: handlePlayerSpeedUpdate,
    [UpdateOpcode.PLAYER_INV]: handlePlayerInventoryUpdate,
    [UpdateOpcode.PLANT]: handlePlantUpdate,
};

function handleUpdate(worldSession: WorldSession, worldPacket: WorldPacket) {
    worldPacket.shift(); // opcode
    const timestamp = worldPacket.shift() as number;

    for(let i = 0; i < worldPacket.length; ) {
        const updateOpcode = worldPacket[i] as UpdateOpcode;
        const updateHandler = updateHandlers[updateOpcode];
        const dataSize = updateDataSize[updateOpcode];

        const guid = worldPacket[i + 1] as number;

        const dataStart = i + UPDATE_HEADERS_SIZE;

        updateHandler(worldSession, timestamp, guid, worldPacket.slice(dataStart, dataStart + dataSize));

        i += UPDATE_HEADERS_SIZE + dataSize;
    }
}

function handleUnitNewUpdate(worldSession: WorldSession, timestamp: number, guid: number, data: unknown[]) {
    const worldScene = worldSession.worldScene;

    const unit = new Unit(worldScene);

    unit.guid = guid;
    unit.typeId = data[0] as Type;

    if (isPlayer(unit)) {
        const player = unit;

        worldSession.player = player;

        initPlayerState(player).draw();

        resetPrediction(unit);
    }

    if (unit.typeId == Type.MOB) {
        const npcState = initNpcState(unit);

        npcState.roles = data[1] as Role[];
    }

    unit.setInteractive(new Rectangle(UNIT_BODY_WIDTH / 2, 0 , UNIT_BODY_WIDTH, UNIT_BODY_HEIGHT), Rectangle.Contains);

    addUnitToWorld(unit);

    unit.nameText.text = data[2] as string;
}

function handleUnitAckUpdate(worldSession: WorldSession, timestamp: number, guid: number) {
    const worldScene = worldSession.worldScene;

    const unit = worldScene.units[guid] as Unit;

    const lastSnapshotState = lastSnapshot(unit).state;

    pushToUnitSnapshots(unit, {
        x: lastSnapshotState.x, y: lastSnapshotState.y, vx: lastSnapshotState.vx, vy: lastSnapshotState.vy
    }, timestamp);
}

function handleUnitSkinUpdate(worldSession: WorldSession, timestamp: number, guid: number, data: unknown[]) {
    const worldScene = worldSession.worldScene;

    const unit = worldScene.units[guid] as Unit;

    unit.skin = data[0] as number;
}

function handleUnitPositionUpdate(worldSession: WorldSession, timestamp: number, guid: number, data: unknown[]) {
    const worldScene = worldSession.worldScene;

    const unit = worldScene.units[guid] as Unit;

    const x = data[0] as number;
    const y = data[1] as number;
    const vx = data[2] as number;
    const vy = data[3] as number;

    pushToUnitSnapshots(unit, { x, y, vx, vy }, timestamp);

    if (!INTERPOLATE) {
        unit.setPosition(x, y);
        unit.setDir(vx, vy);
    }
}

function handlePlayerAckUpdate(worldSession: WorldSession, timestamp: number, guid: number, data: unknown[]) {
    if (CLIENT_PREDICT) {
        const player = worldSession.player;

        const ackTick = data[0] as number;

        const lastSnapshotPos = lastSnapshot(player).state;

        reconcilePlayerPosition(player, lastSnapshotPos, ackTick);
    }
}

function handlePlayerSpeedUpdate(worldSession: WorldSession, timestamp: number, guid: number, data: unknown[]) {
    const player = worldSession.player;

    const playerState = getPlayerState(player);

    playerState.speed = data[0] as number;
}

function lastSnapshot(unit: Unit) {
    const snapshots = unit.snapshots;

    return snapshots[snapshots.length - 1];
}

function handlePlayerInventoryUpdate(worldSession: WorldSession, timestamp: number, guid: number, data: unknown[]) {
    const player = worldSession.player;

    const inventory = getPlayerState(player).inventory;

    const inventoryState = data[0] as number[];
    const gold = data[1] as number;

    for(let i = 0, slot = 0; i < inventoryState.length; i++, slot++) {
        const id = inventoryState[i];
        inventory.putItem(slot, id ? {id, stack: inventoryState[++i]} : null);
    }

    inventory.putGold(gold);
}

function handlePlantUpdate(worldSession: WorldSession, timestamp: number, guid: number, data: unknown[]) {
    const worldScene = worldSession.worldScene;

    const x = data[0] as number;
    const y = data[1] as number;
    const kind = data[2] as number;

    const plant = new Plant(worldScene, kind, x, y);

    plant.guid = guid;
    plant.typeId = Type.PLANT;

    plant.setInteractive();

    addPlantToWorld(plant);
}

function pushToUnitSnapshots(unit: Unit, state: SnapshotState, timestamp: number) {
    const snapshots = unit.snapshots;

    trimStateBuffer(snapshots);

    if (INTERPOLATE_DROP_DUPLICATES) {
        deduplicateUnitSnapshots(snapshots, state);
    }

    snapshots.push({state, timestamp});
}

function trimStateBuffer(snapshots: Snapshot[]) {
    if (snapshots.length > INTERPOLATE_BUFFER_SIZE) snapshots.splice(0, 1);
}

function deduplicateUnitSnapshots(snapshots: Snapshot[], pos: Vec2) {
    if (snapshots.length > 2) {
        const lastIndex = snapshots.length - 1;
        const last = snapshots[lastIndex];
        if (!equals(pos, last.state)) {
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
        removePlayerFromWorldSession(worldSession);

        worldScene.gameMenu.showJoinMenu();
    }

    deleteUnitFromWorld(unit);
}

export {
    handleUpdate,
    handleDestroy
}
