import Controller from "./Controller";
import {Opcode, TICK} from "@leela/common";
import {toVec2} from "../control";
import SimulationSystem from "../../network/SimulationSystem";
import WorldScene from "../world/WorldScene";
import OutgoingSystem from "../../network/OutgoingSystem";

export default class SampleInputSystem {

    private readonly simulations: SimulationSystem;
    private readonly outgoing: OutgoingSystem;

    private readonly worldScene: WorldScene;

    constructor(private readonly controller: Controller) {
        this.simulations = this.controller.network.simulations;
        this.outgoing = this.controller.network.outgoing;

        this.worldScene = this.controller.worldScene;

        this.simulations.events.on(TICK, this.sampleInput, this);
    }

    private sampleInput() {
        const playerChar = this.controller.playerChar;

        if (playerChar) {
            const dir = toVec2(this.worldScene.keys);

            this.outgoing.push(Opcode.Move, dir);
        }
    }
}
