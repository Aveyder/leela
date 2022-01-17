import Controller from "./Controller";
import {move, Opcode, TICK, Vec2} from "@leela/common";
import {toVec2} from "../control";
import SimulationSystem from "../../network/SimulationSystem";
import WorldScene from "../world/WorldScene";
import OutgoingSystem from "../../network/OutgoingSystem";
import UPDATE = Phaser.Scenes.Events.UPDATE;
import {CLIENT_PREDICT} from "../../constants/config";
import {MOVEMENT} from "../../constants/keys";
import ReconcileSystem from "../../network/reconcile/ReconcileSystem";
import MovementSystem from "../world/MovementSystem";

export default class PlayerControlSystem {

    private readonly simulations: SimulationSystem;
    private readonly outgoing: OutgoingSystem;

    private readonly reconciliation: ReconcileSystem;

    private readonly worldScene: WorldScene;
    private readonly move: MovementSystem;

    private readonly tmpVec2: Vec2;

    private dir: Vec2;

    constructor(private readonly controller: Controller) {
        this.simulations = this.controller.network.simulations;
        this.outgoing = this.controller.network.outgoing;

        this.reconciliation = this.controller.network.reconciliation;

        this.worldScene = this.controller.worldScene;
        this.move = this.worldScene.move;

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
            this.dir = toVec2(this.worldScene.keys);

            if (this.dir.x != 0 || this.dir.y != 0) {
                this.outgoing.push(Opcode.Move, [this.dir.x, this.dir.y]);
            }
        }
    }

    private update(time: number, delta: number) {
        const player = this.worldScene.player;

        if (player && CLIENT_PREDICT) {
            let pos: Vec2;
            if (this.dir && (this.dir.x != 0 || this.dir.y != 0)) {
                pos = move(player, this.dir, delta / 1000, this.tmpVec2);
            } else {
                pos = player;
            }

            this.move.char(player, pos.x, pos.y);

            this.reconciliation.push(MOVEMENT, this.dir, delta / 1000);
        }
    }
}
