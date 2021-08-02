import {SIMULATION_RATE, SNAPSHOT_RATE} from "../constants/config";

function adjustWithRate(rate: number, adjustWithRate: number): number {
    return (!Number.isInteger(rate) || rate <= 0 || rate > adjustWithRate)
        ? adjustWithRate : rate;
}

function getSnapshotRate() {
    return adjustWithRate(SNAPSHOT_RATE, SIMULATION_RATE);
}

export {
    adjustWithRate,
    getSnapshotRate
};
