import WorldSession from "../client/WorldSession";
import {Role, Update, WorldPacket} from "@leela/common";
import Unit, {addUnitToWorld, deleteUnitFromWorld, hasRole, isPlayer, Snapshot, SnapshotState} from "../entities/Unit";
import {reconcilePlayerPosition, resetPrediction} from "../movement/playerPrediction";
import {CLIENT_PREDICT, INTERPOLATE, INTERPOLATE_BUFFER_SIZE, INTERPOLATE_DROP_DUPLICATES} from "../config";
import {posEquals} from "../movement/position";
import PlayerState, {PLAYER_STATE} from "../entities/PlayerState";
import cursorVendor from "../../public/assets/cursor-vendor.png";

type UnitUpdate = {
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

function handleUpdate(worldSession: WorldSession, worldPacket: WorldPacket) {
    const worldScene = worldSession.worldScene;

    worldPacket.shift(); // opcode
    const timestamp = worldPacket.shift() as number;
    const ackTick = worldPacket.shift() as number;
    const speed = worldPacket.shift() as number;

    const unitUpdates = deserializeUnitUpdates(worldSession, worldPacket);

    unitUpdates.forEach(unitUpdate => {
        let unit = worldScene.units[unitUpdate.guid] as Unit;

        switch (unitUpdate.update) {
            case Update.FULL:
                if (!unit) unit = initUnit(worldSession, unitUpdate);
                unit.skin = unitUpdate.skin;
                if (hasRole(unit, Role.VENDOR)) {
                    unit.setInteractive({cursor: `url(${cursorVendor}), pointer`})
                }
                break;
            case Update.EMPTY:
                setLastSnapshotState(unitUpdate, unit);
                break;
            case Update.SKIN:
                unit.skin = unitUpdate.skin;
                return;
            case Update.POSITION:
                break;
        }

        pushToUnitSnapshots(unit, unitUpdate, timestamp);

        if (isPlayer(unit)) {
            const playerState = unit.getData(PLAYER_STATE) as PlayerState;

            playerState.speed = speed;

            if (CLIENT_PREDICT) reconcilePlayerPosition(unit, unitUpdate, ackTick);
        }

        if (!INTERPOLATE) {
            unit.setPosition(unitUpdate.x, unitUpdate.y);
            unit.setDir(unitUpdate.vx, unitUpdate.vy);
        }
    });
}

function deserializeUnitUpdates(worldSession: WorldSession, input: unknown[]): UnitUpdate[] {
    const unitUpdates = [];

    for (let i = 0; i < input.length;) {
        const update = input[i];

        let unitUpdate;
        switch (update) {
            case Update.FULL:
                unitUpdate = deserializeFullUnitUpdate(i + 1, input);
                i += 9;
                break;
            case Update.EMPTY:
                unitUpdate = deserializeEmptyUnitUpdate(i + 1, input);
                i += 2;
                break;
            case Update.SKIN:
                unitUpdate = deserializeSkinUnitUpdate(i + 1, input);
                i += 3;
                break;
            case Update.POSITION:
                unitUpdate = deserializePositionUnitUpdate(i + 1, input);
                i += 6;
                break;
        }

        unitUpdate.update = update;

        unitUpdates.push(unitUpdate);
    }

    return unitUpdates;
}

function deserializeFullUnitUpdate(index: number, serialized: unknown[]) {
    return {
        guid: serialized[index] as number,
        typeId: serialized[index + 1] as number,
        roles: serialized[index + 2] as number[],
        x: serialized[index + 3] as number,
        y: serialized[index + 4] as number,
        skin: serialized[index + 5] as number,
        vx: serialized[index + 6] as number,
        vy: serialized[index + 7] as number
    } as UnitUpdate;
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

function deserializePositionUnitUpdate(index: number, serialized: unknown[]) {
    return {
        guid: serialized[index] as number,
        x: serialized[index + 1] as number,
        y: serialized[index + 2] as number,
        vx: serialized[index + 3] as number,
        vy: serialized[index + 4] as number
    } as UnitUpdate;
}

function initUnit(worldSession: WorldSession, unitUpdateState: UnitUpdate) {
    const worldScene = worldSession.worldScene;

    const unit = new Unit(worldScene);

    unit.guid = unitUpdateState.guid;
    unit.typeId = unitUpdateState.typeId;
    unit.roles = unitUpdateState.roles;
    unit.setPosition(unitUpdateState.x, unitUpdateState.y);

    if (isPlayer(unit)) {
        worldSession.player = unit;

        unit.setData(PLAYER_STATE, new PlayerState())

        resetPrediction(unit);
    }

    addUnitToWorld(unit);

    return unit;
}

function setLastSnapshotState(unitUpdate: UnitUpdate, unit: Unit) {
    const snapshots = unit.snapshots;

    const lastSnapshotState = snapshots[snapshots.length - 1];

    unitUpdate.x = lastSnapshotState.state.x;
    unitUpdate.y = lastSnapshotState.state.y;
    unitUpdate.vx = lastSnapshotState.state.vx;
    unitUpdate.vy = lastSnapshotState.state.vy;
}

function pushToUnitSnapshots(unit: Unit, snapshotState: SnapshotState, timestamp: number) {
    const snapshots = unit.snapshots;

    trimStateBuffer(snapshots);

    if (INTERPOLATE_DROP_DUPLICATES) {
        deduplicateUnitSnapshots(snapshots, snapshotState);
    }

    snapshots.push({state: snapshotState, timestamp});
}

function trimStateBuffer(snapshots: Snapshot[]) {
    if (snapshots.length > INTERPOLATE_BUFFER_SIZE) snapshots.splice(0, 1);
}

function deduplicateUnitSnapshots(snapshots: Snapshot[], unitState: SnapshotState) {
    if (snapshots.length > 2) {
        const lastIndex = snapshots.length - 1;
        const last = snapshots[lastIndex];
        if (!posEquals(unitState, last.state)) {
            let count = 1;
            for(let i = lastIndex - 1; i >= 0; i--) {
                const cur = snapshots[i];
                if (posEquals(cur.state, last.state)) {
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

    if (isPlayer(unit)) {
        worldSession.playerGuid = null;
        worldSession.player = null;
        worldScene.showMenu();
    }

    deleteUnitFromWorld(unit);
}

export {
    handleUpdate,
    handleDestroy
}