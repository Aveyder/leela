import OutgoingSystem from "../network/OutgoingSystem";
import {Loop, SIMULATION_RATE} from "@leela/common";
import {CLIENT_CMD_RATE} from "../constants/config";

export default class CommandSystem {

    public readonly loop: Loop;

    constructor(
        private readonly outgoing: OutgoingSystem
    ) {
        this.loop = new Loop(
            () => this.tick(),
            CLIENT_CMD_RATE == -1 ? SIMULATION_RATE : CLIENT_CMD_RATE
        );
    }

    private tick() {
        this.outgoing.send();
    }
}
