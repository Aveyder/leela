import OutgoingSystem from "./OutgoingSystem";
import {Loop, Opcode, SIMULATION_RATE} from "@leela/common";
import {CLIENT_CMD_RATE} from "../constants/config";

export default class CommandSystem {

    public readonly loop: Loop;

    constructor(
        private readonly outgoing: OutgoingSystem
    ) {
        this.loop = new Loop(
            () => this.tick(),
            CLIENT_CMD_RATE + 1 == 0 ? SIMULATION_RATE : CLIENT_CMD_RATE
        );
    }

    private tick() {
        this.outgoing.push(Opcode.Tick);
        this.outgoing.send();
    }
}
