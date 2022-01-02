import {Keys} from "../types";
import WorldScene from "./WorldScene";
import {toVec2} from "../control";
import {move, Vec2} from "@leela/common";
import EventEmitter = Phaser.Events.EventEmitter;
import UPDATE = Phaser.Scenes.Events.UPDATE;
import MovementSystem from "./MovementSystem";

export default class PlayerControlSystem {

    private events: EventEmitter;

    private readonly keys: Keys;

    private readonly move: MovementSystem;

    private readonly tmpVec2: Vec2;

    constructor(private worldScene: WorldScene) {
        this.events = worldScene.events;

        this.keys = worldScene.keys;

        this.move = worldScene.move;

        this.tmpVec2 = {x: 0, y: 0};

        this.init();
    }

    private init() {
        this.events.on(UPDATE, this.update, this);
    }

    private update(time: number, delta: number): void {
        const player = this.worldScene.player;
        if (player) {
            const dir = toVec2(this.keys, this.tmpVec2);

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
