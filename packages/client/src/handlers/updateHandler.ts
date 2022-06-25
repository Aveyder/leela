import WorldSession from "../client/WorldSession";
import {WorldPacket} from "@leela/common";
import Unit, {addUnitToWorld, deleteUnitFromWorld, isPlayer, UnitState, UnitStateBuffer} from "../entities/Unit";
import {PlayerKey} from "../entities/PlayerKey";
import {reconcilePlayerPosition, resetPrediction} from "../movement/playerPrediction";
import {CLIENT_PREDICT, INTERPOLATE, INTERPOLATE_BUFFER_MS, INTERPOLATE_DROP_DUPLICATES} from "../config";
import WorldScene from "../world/WorldScene";
import {posEquals} from "../movement/position";


function handleUpdate(worldSession: WorldSession, worldPacket: WorldPacket) {
    const worldScene = worldSession.worldScene;

    worldPacket.shift(); // opcode
    const timestamp = worldPacket.shift() as number;
    const tick = worldPacket.shift() as number;

    const updates = deserializeUpdate(worldSession, worldPacket);

    updates.forEach(unitState => {
        let unit = worldScene.units[unitState.guid] as Unit;

        if (!unit) {
            unit = new Unit(worldScene);

            unit.guid = unitState.guid;
            unit.typeId = unitState.typeId;
            unit.setPosition(unitState.x, unitState.y);

            if (isPlayer(unit)) {
                worldSession.player = unit;

                unit.setData(PlayerKey.WORLD_SESSION, worldSession);
                unit.setData(PlayerKey.PREDICTION_APPLIED_CONTROLS, []);

                resetPrediction(unit);
            }

            addUnitToWorld(unit);
        }

        unit.skin = unitState.skin;

        unit.remotePos.x = unitState.x;
        unit.remotePos.y = unitState.y;

        if (CLIENT_PREDICT && isPlayer(unit)) {
            unit.setData(PlayerKey.PREDICTION_ACK_TICK, tick);
            reconcilePlayerPosition(unit, unitState);
        } else {
            if (INTERPOLATE) {
                pushToUnitStateBuffer(unit, unitState, timestamp);
            } else {
                unit.setPosition(unitState.x, unitState.y);
                unit.setDir(unitState.vx, unitState.vy);
            }
        }
    });
}

function deserializeUpdate(worldSession: WorldSession, input: unknown[]): UnitState[] {
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
    } as UnitState;
}

function pushToUnitStateBuffer(unit: Unit, unitState: UnitState, timestamp: number) {
    const worldScene = unit.scene as WorldScene;

    const unitStateBuffer = unit.stateBuffer;

    const serverNow = worldScene.worldClient.ts.now();

    trimStateBuffer(unitStateBuffer, serverNow);

    if (INTERPOLATE_DROP_DUPLICATES) {
        deduplicateUnitStateBuffer(unitStateBuffer, unitState);
    }

    unitStateBuffer.push({state: unitState, timestamp});
}

function trimStateBuffer(unitStateBuffer: UnitStateBuffer, serverNow: number) {
    if (unitStateBuffer.length > 0) {
        let i = 0;
        while (serverNow - unitStateBuffer[i].timestamp > INTERPOLATE_BUFFER_MS && ++i < unitStateBuffer.length);

        unitStateBuffer.splice(0, i);
    }
}

function deduplicateUnitStateBuffer(unitStateBuffer: UnitStateBuffer, unitState: UnitState) {
    if (unitStateBuffer.length > 2) {
        const lastIndex = unitStateBuffer.length - 1;
        const last = unitStateBuffer[lastIndex];
        if (!posEquals(unitState, last.state)) {
            let count = 1;
            for(let i = lastIndex - 1; i >= 0; i--) {
                const cur = unitStateBuffer[i];
                if (posEquals(cur.state, last.state)) {
                    if (count < INTERPOLATE_DROP_DUPLICATES) {
                        count++;
                    } else {
                        break;
                    }
                } else {
                    if (count > 1) {
                        unitStateBuffer.splice(i + 2);
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