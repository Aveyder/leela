import Controller from "./Controller";
import {Opcode, TICK, Vec2} from "@leela/common";
import {toVec2} from "../control";
import SimulationSystem from "../../network/SimulationSystem";
import WorldScene from "../world/WorldScene";
import OutgoingSystem from "../../network/OutgoingSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;
import {CLIENT_PREDICT} from "../../constants/config";
import {MOVEMENT} from "../../constants/keys";
import ReconcileSystem from "../../network/reconcile/ReconcileSystem";

export default class PlayerControlSystem {

    private readonly simulations: SimulationSystem;
    private readonly outgoing: OutgoingSystem;

    private readonly reconciliation: ReconcileSystem;

    private readonly worldScene: WorldScene;

    private readonly tmpVec2: Vec2;

    constructor(private readonly controller: Controller) {
        this.simulations = this.controller.network.simulations;
        this.outgoing = this.controller.network.outgoing;

        this.reconciliation = this.controller.network.reconciliation;

        this.worldScene = this.controller.worldScene;

        this.tmpVec2 = {x: 0, y: 0};

        this.init();
    }

    private init() {
        this.simulations.events.on(TICK, this.sampleInput, this);
        this.worldScene.events.on(UPDATE, this.update, this);
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

    private update(time: number, delta: number) {
        const playerId = this.controller.playerId;

        if (playerId != undefined && CLIENT_PREDICT) {
            const dirVec = toVec2(this.worldScene.keys);

            this.reconciliation.push(MOVEMENT, dirVec, delta / 1000);
        }
    }
}
