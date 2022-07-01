import WorldSession from "../client/WorldSession";
import {WorldPacket} from "@leela/common";
import Unit, {addUnitToWorld, deleteUnitFromWorld, isPlayer, Snapshot, SnapshotState} from "../entities/Unit";
import {reconcilePlayerPosition, resetPrediction} from "../movement/playerPrediction";
import {CLIENT_PREDICT, INTERPOLATE, INTERPOLATE_BUFFER_MS, INTERPOLATE_DROP_DUPLICATES} from "../config";
import WorldScene from "../world/WorldScene";
import {posEquals} from "../movement/position";
import PlayerState, {PLAYER_STATE} from "../entities/PlayerState";

type UnitUpdateState = {
    guid: number,
    typeId: number,
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

    const update = deserializeUpdate(worldSession, worldPacket);

    update.forEach(unitUpdateState => {
        let unit = worldScene.units[unitUpdateState.guid] as Unit;

        if (!unit) unit = initUnit(worldSession, unitUpdateState)

        unit.skin = unitUpdateState.skin;

        pushToUnitSnapshots(unit, unitUpdateState, timestamp);

        if (isPlayer(unit)) {
            const playerState = unit.getData(PLAYER_STATE) as PlayerState;

            playerState.speed = speed;

            if (CLIENT_PREDICT) reconcilePlayerPosition(unit, unitUpdateState, ackTick);
        }

        if (!INTERPOLATE) {
            unit.setPosition(unitUpdateState.x, unitUpdateState.y);
            unit.setDir(unitUpdateState.vx, unitUpdateState.vy);
        }
    });
}

function deserializeUpdate(worldSession: WorldSession, input: unknown[]): UnitUpdateState[] {
    const update = [];

    for (let i = 0; i < input.length; i += 7) {
        const unitState = deserializeUnitState(i, input);

        update.push(unitState);
    }

    return update;
}

function deserializeUnitState(index: number, serialized: unknown[]) {
    return {
        guid: serialized[index] as number,
        typeId: serialized[index + 1] as number,
        x: serialized[index + 2] as number,
        y: serialized[index + 3] as number,
        skin: serialized[index + 4] as number,
        vx: serialized[index + 5] as number,
        vy: serialized[index + 6] as number
    } as UnitUpdateState;
}

function initUnit(worldSession: WorldSession, unitUpdateState: UnitUpdateState) {
    const worldScene = worldSession.worldScene;

    const unit = new Unit(worldScene);

    unit.guid = unitUpdateState.guid;
    unit.typeId = unitUpdateState.typeId;
    unit.setPosition(unitUpdateState.x, unitUpdateState.y);

    if (isPlayer(unit)) {
        worldSession.player = unit;

        unit.setData(PLAYER_STATE, new PlayerState())

        resetPrediction(unit);
    }

    addUnitToWorld(unit);

    return unit;
}

function pushToUnitSnapshots(unit: Unit, snapshotState: SnapshotState, timestamp: number) {
    const worldScene = unit.scene as WorldScene;

    const snapshots = unit.snapshots;

    const serverNow = worldScene.worldClient.ts.now();

    trimStateBuffer(snapshots, serverNow);

    if (INTERPOLATE_DROP_DUPLICATES) {
        deduplicateUnitSnapshots(snapshots, snapshotState);
    }

    snapshots.push({state: snapshotState, timestamp});
}

function trimStateBuffer(snapshots: Snapshot[], serverNow: number) {
    if (snapshots.length > 0) {
        let i = 0;
        while (serverNow - snapshots[i].timestamp > INTERPOLATE_BUFFER_MS && ++i < snapshots.length);

        snapshots.splice(0, i);
    }
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