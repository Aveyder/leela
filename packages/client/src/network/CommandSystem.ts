import OutgoingSystem from "./OutgoingSystem";
import {SIMULATION_RATE} from "@leela/common";
import {CLIENT_CMD_RATE} from "../constants/config";
import TimeStepLoop from "./TimeStepLoop";

export default class CommandSystem {

    public readonly loop: TimeStepLoop;

    constructor(
        private readonly outgoing: OutgoingSystem
    ) {
        this.loop = new TimeStepLoop(
            () => this.tick(),
            CLIENT_CMD_RATE < 0 ? SIMULATION_RATE : CLIENT_CMD_RATE
        );
    }

    private tick() {
        this.outgoing.send();
    }
}
