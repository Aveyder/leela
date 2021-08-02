import {SNAPSHOT_INTERVAL_MS} from "../constants/config";
import OutgoingSystem from "../network/OutgoingSystem";

export default class SnapshotLoop {

    constructor(
        private readonly outgoing: OutgoingSystem
    ) {
    }

    public start(): void {
        setInterval(() => {
            // push world snapshot packets to clients

            this.outgoing.send();
        }, SNAPSHOT_INTERVAL_MS);
    }
}
