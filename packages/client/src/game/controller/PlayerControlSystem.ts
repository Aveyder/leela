import Controller from "./Controller";
import {move, Vec2} from "@leela/common";
import WorldScene from "../world/WorldScene";
import MovementSystem from "../world/MovementSystem";
import {Keys} from "../types";
import {toVec2} from "../control";

export default class PlayerControlSystem {

    private readonly worldScene: WorldScene;
    private readonly move: MovementSystem;

    private readonly tmpVec2: Vec2;

    constructor(private readonly controller: Controller) {
        this.worldScene = this.controller.worldScene;
        this.move = this.worldScene.move;

        this.tmpVec2 = {x: 0, y: 0};
    }

    public apply(keys: Keys, delta: number): void {
        const player = this.controller.player;

        if (player) {
            const dir = toVec2(keys, this.tmpVec2);

            let pos: Vec2;
            if (dir.x != 0 || dir.y != 0) {
                pos = move(player, dir, delta / 1000, this.tmpVec2);
            } else {
                pos = player;
            }

            this.move.char(player, pos.x, pos.y);
        }
    }
}
