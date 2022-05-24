import Controller from "./Controller";
import {Opcode, TICK, Vec2} from "@leela/common";
import {toVec2} from "../control";
import SimulationSystem from "../../network/SimulationSystem";
import WorldScene from "../world/WorldScene";
import OutgoingSystem from "../../network/OutgoingSystem";
import {CLIENT_PREDICT} from "../../constants/config";
import {POSITION} from "../../constants/keys";
import ReconcileSystem from "../../network/reconcile/ReconcileSystem";
import PlayerControlSystem from "./PlayerControlSystem";
import {Keys} from "../types";
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class InputSystem {

    private readonly simulations: SimulationSystem;
    private readonly outgoing: OutgoingSystem;

    private readonly reconciliation: ReconcileSystem;

    private readonly control: PlayerControlSystem;

    private readonly worldScene: WorldScene;

    private keys: Keys;

    private dir: Vec2;

    constructor(private readonly controller: Controller) {
        this.simulations = this.controller.network.simulations;
        this.outgoing = this.controller.network.outgoing;

        this.reconciliation = this.controller.network.reconciliation;

        this.control = this.controller.control;

        this.worldScene = this.controller.worldScene;

        this.init();
    }

    private init() {
        this.simulations.events.on(TICK, this.sampleInput, this);
        this.worldScene.events.on(UPDATE, this.update, this);
    }

    private sampleInput() {
        const playerId = this.controller.playerId;

        if (playerId != undefined) {
            this.keys = this.worldScene.keys;

            this.dir = toVec2(this.keys);

            if (this.dir.x != 0 || this.dir.y != 0) {
                this.outgoing.push(Opcode.Move, [this.dir.x, this.dir.y]);
            }
        }
    }

    private update(time: number, delta: number) {
        const playerId = this.controller.playerId;

        if (CLIENT_PREDICT && playerId != undefined && this.keys) {
            this.control.apply(this.keys, delta);

            this.reconciliation.push(POSITION, this.dir, delta / 1000);
        }
    }
}
