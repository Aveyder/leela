import WorldScene from "../world/WorldScene";
import {CLIENT_PREDICT, ENTITY_EXTRAPOLATE, ENTITY_EXTRAPOLATE_MAX_MS, INTERPOLATE} from "../config";
import {INTERPOLATE_MS, posInterpolator, TMP_VEC2, Vec2} from "@leela/common";
import Unit, {isPlayer, SnapshotState} from "../entities/Unit";

function updateUnitPositions(worldScene: WorldScene) {
    if (!INTERPOLATE) return;

    const ts = worldScene.worldClient.ts;

    const serverNow = ts.now();

    Object.values(worldScene.units).forEach(unit => interpolateUnitPosition(unit, serverNow));
}

function interpolateUnitPosition(unit: Unit, serverNow: number) {
    if (CLIENT_PREDICT && isPlayer(unit)) return;

    const snapshots = unit.snapshots;

    if (snapshots.length == 0) return;

    const lerpMoment = serverNow - INTERPOLATE_MS;

    let lerpMomentState: SnapshotState;
    let lerpPos: Vec2;

    const firstSnapshot = snapshots[0];

    if (snapshots.length == 1 || lerpMoment < snapshots[0].timestamp) {
        lerpPos = lerpMomentState = firstSnapshot.state;
    } else {
        const lastIndex = snapshots.length - 1;
        const lastSnapshot = snapshots[lastIndex];

        let lerpStartSnapshot;
        let lerpEndSnapshot;

        if (lerpMoment > lastSnapshot.timestamp) {
            if (ENTITY_EXTRAPOLATE && lerpMoment <= lastSnapshot.timestamp + ENTITY_EXTRAPOLATE_MAX_MS) {
                lerpStartSnapshot = snapshots[lastIndex - 1];
                lerpEndSnapshot = lastSnapshot;
                lerpMomentState = lastSnapshot.state;
            } else {
                lerpPos = lerpMomentState = lastSnapshot.state;
            }
        } else {
            let beforeIndex = -1;
            for (let i = lastIndex; i >= 0 && beforeIndex == -1; i--) {
                if (snapshots[i].timestamp < lerpMoment) {
                    beforeIndex = i;
                }
            }

            lerpStartSnapshot = snapshots[beforeIndex];
            lerpEndSnapshot = snapshots[beforeIndex + 1];
            lerpMomentState = lerpStartSnapshot.state;
        }

        if (lerpStartSnapshot && lerpEndSnapshot) {
            const progress = (lerpMoment - lerpStartSnapshot.timestamp) / (lerpEndSnapshot.timestamp - lerpStartSnapshot.timestamp);

            lerpPos = posInterpolator(lerpStartSnapshot.state, lerpEndSnapshot.state, progress, TMP_VEC2);
        }
    }

    unit.setPosition(lerpPos.x, lerpPos.y);
    unit.setDir(lerpMomentState.vx, lerpMomentState.vy);
}

export {
    updateUnitPositions
}
