import WorldScene from "../world/WorldScene";
import {ENTITY_EXTRAPOLATE, ENTITY_EXTRAPOLATE_MAX_MS, ENTITY_EXTRAPOLATE_PAST, INTERPOLATE} from "../config";
import {INTERPOLATE_MS, posInterpolator, TMP_VEC2, Vec2} from "@leela/common";
import Unit, {UnitState, UnitStateBuffer} from "../entities/Unit";

function updateUnitPositions(worldScene: WorldScene) {
    if (!INTERPOLATE) return;

    const ts = worldScene.worldClient.ts;

    Object.values(worldScene.units).forEach(unit => {
        const updateBuffer = unit.stateBuffer;

        const serverNow = ts.now();

        interpolate(updateBuffer, serverNow, unit);
    });
}

// TODO: refactor this
function interpolate(updateBuffer: UnitStateBuffer, serverNow: number, unit: Unit) {
    if (updateBuffer.length == 0) return;

    let pos: Vec2;
    let state: UnitState;

    const interpolationMoment = serverNow - INTERPOLATE_MS;
    const last = updateBuffer.length - 1;
    if (updateBuffer.length > 1) {
        let before = -1;
        for (let i = last; i >= 0 && before == -1; i--) {
            if (updateBuffer[i].timestamp < interpolationMoment) {
                before = i;
            }
        }

        let start = -1;
        if (before != -1) {
            if (before != last) {
                start = before;
            } else if (ENTITY_EXTRAPOLATE) {
                const extrapolate = interpolationMoment - updateBuffer[last].timestamp <= ENTITY_EXTRAPOLATE_MAX_MS;
                if (extrapolate) {
                    start = last - 1;
                }
            }
        } else if (ENTITY_EXTRAPOLATE_PAST) {
            start = 0;
        }

        if (start != -1) {
            const end = start + 1;

            const s1 = updateBuffer[start];
            const s2 = updateBuffer[end];

            const progress = (interpolationMoment - s1.timestamp) / (s2.timestamp - s1.timestamp);

            pos = posInterpolator(s1.state, s2.state, progress, TMP_VEC2);
            state = s1.state;
        }
    }

    if (!pos && updateBuffer.length > 0) {
        const lastUpdate = updateBuffer[last];
        const firstUpdate = updateBuffer[0];

        pos = state = (firstUpdate.timestamp >= interpolationMoment) ? firstUpdate.state : lastUpdate.state;
    }

    if (pos) {
        unit.x = pos.x;
        unit.y = pos.y;
        unit.setDir(state.vx, state.vy);
    }
}

export {
    updateUnitPositions
}
