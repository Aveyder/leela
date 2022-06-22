import WorldSession from "../client/WorldSession";
import {Unit as UnitState, WorldPacket} from "@leela/common";
import Unit, {UnitUpdate} from "../entities/Unit";
import {PlayerKey} from "../entities/PlayerKey";
import {reconcilePlayerPosition} from "../movement/playerPositionPrediction";
import {
    CLIENT_PREDICT,
    INTERPOLATE,
    INTERPOLATE_BUFFER_MS,
    INTERPOLATE_DROP_DUPLICATES,
    INTERPOLATE_DROP_DUPLICATES_MAX
} from "../config";
import WorldScene from "../world/WorldScene";
import {posEquals} from "../movement/position";


function handleUpdate(worldSession: WorldSession, worldPacket: WorldPacket) {
    const worldScene = worldSession.worldScene;

    worldPacket.shift(); // opcode
    const timestamp = worldPacket.shift() as number;
    const tick = worldPacket.shift() as number;

    const updates = deserializeUpdate(worldPacket);

    updates.forEach(unitUpdate => {
        let unit = worldScene.units[unitUpdate.guid] as Unit;

        if (!unit) {
            const guid = unitUpdate.guid;

            unit = new Unit(worldScene);

            unit.guid = guid;
            unit.typeId = unitUpdate.typeId;
            unit.setPosition(unitUpdate.x, unitUpdate.y);

            if (worldSession.playerGuid == unitUpdate.guid) {
                worldSession.player = unit;

                unit.setData(PlayerKey.PREDICTION_APPLIED_CONTROLS, []);
                unit.setData(PlayerKey.PREDICTION_LERP_PROGRESS, -1);
                unit.setData(PlayerKey.PREDICTION_LERP_START_TIME, -1);
                unit.setData(PlayerKey.PREDICTION_LERP_DURATION, -1);

                unit.setData(PlayerKey.ERROR_TIMER, -1);

                unit.setData(PlayerKey.WORLD_SESSION, worldSession);
            }

            addUnitToWorld(unit);
        }

        unit.skin = unitUpdate.skin;
        unit.remotePos.x = unitUpdate.x;
        unit.remotePos.y = unitUpdate.y;

        if (shouldPredict(unit)) {
            unit.setData(PlayerKey.PREDICTION_ACK_TICK, tick);

            reconcilePlayerPosition(unit, unitUpdate);
        } else {
            if (INTERPOLATE) {
                const updateBuffer = unit.updateBuffer;

                const serverNow = worldScene.worldClient.ts.now();

                trimUpdateBuffer(updateBuffer, serverNow);

                if (INTERPOLATE_DROP_DUPLICATES) {
                    deduplicateUpdateBuffer(updateBuffer, unitUpdate);
                }

                updateBuffer.push({state: unitUpdate, timestamp});
            } else {
                unit.setPosition(unitUpdate.x, unitUpdate.y);
                unit.setDir(unitUpdate.vx, unitUpdate.vy);
            }
        }
    });
}

function deserializeUpdate(input: unknown[]): UnitState[] {
    const update = [];

    for (let i = 0; i < input.length; i += 7) {
        const unit = deserializeUnit(i, input);

        update.push(unit);
    }

    return update;
}

function deserializeUnit(index: number, serialized: unknown[]) {
    return {
        guid: serialized[index] as number,
        typeId: serialized[index + 1] as number,
        x: serialized[index + 2] as number,
        y: serialized[index + 3] as number,
        skin: serialized[index + 4] as number,
        vx: serialized[index + 5] as number,
        vy: serialized[index + 6] as number
    } as UnitState;
}

function shouldPredict(unit: Unit) {
    const worldSession = unit.getData(PlayerKey.WORLD_SESSION);

    return worldSession && CLIENT_PREDICT;
}

function trimUpdateBuffer(updateBuffer: UnitUpdate[], serverNow: number) {
    if (updateBuffer.length > 0) {
        let i = 0;
        while (serverNow - updateBuffer[i].timestamp > INTERPOLATE_BUFFER_MS && ++i < updateBuffer.length);

        updateBuffer.splice(0, i);
    }
}

function deduplicateUpdateBuffer(updateBuffer: UnitUpdate[], unit: UnitState) {
    if (updateBuffer.length > 2) {
        const lastIndex = updateBuffer.length - 1;
        const last = updateBuffer[lastIndex];
        if (!posEquals(unit, last.state)) {
            let count = 1;
            for(let i = lastIndex - 1; i >= 0; i--) {
                const cur = updateBuffer[i];
                if (posEquals(cur.state, last.state)) {
                    if (count < INTERPOLATE_DROP_DUPLICATES_MAX) {
                        count++;
                    } else {
                        break;
                    }
                } else {
                    if (count > 1) {
                        updateBuffer.splice(i + 2);
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

    if (unit) deleteUnitFromWorld(unit);
}

function addUnitToWorld(unit: Unit) {
    const worldScene = unit.scene as WorldScene;

    worldScene.add.existing(unit);

    const guid = unit.guid;

    worldScene.units[guid] = unit;
}

function deleteUnitFromWorld(unit: Unit) {
    const worldScene = unit.scene as WorldScene;

    unit.destroy();

    const guid = unit.guid;

    delete worldScene.units[guid];
}

export {
    handleUpdate,
    handleDestroy
}