import Controller from "./Controller";
import {Opcode, TICK, Vec2} from "@leela/common";
import {toVec2} from "../control";
import SimulationSystem from "../../network/SimulationSystem";
import WorldScene from "../world/WorldScene";
import OutgoingSystem from "../../network/OutgoingSystem";

export default class PlayerControlSystem {

    private readonly simulations: SimulationSystem;
    private readonly outgoing: OutgoingSystem;

    private readonly worldScene: WorldScene;

    private readonly tmpVec2: Vec2;

    constructor(private readonly controller: Controller) {
        this.simulations = this.controller.network.simulations;
        this.outgoing = this.controller.network.outgoing;

        this.worldScene = this.controller.worldScene;

        this.tmpVec2 = {x: 0, y: 0};

        this.simulations.events.on(TICK, this.sampleInput, this);
    }

    private sampleInput() {
        const playerId = this.controller.playerId;

        if (playerId != undefined) {
            const dir = toVec2(this.worldScene.keys, this.tmpVec2);

            if (dir.x != 0 || dir.y != 0) {
                this.outgoing.push(Opcode.Move, [dir.x, dir.y]);
            }
        }
    }
}
