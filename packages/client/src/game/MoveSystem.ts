import {Keys} from "./types";
import GameScene from "./GameScene";
import {toVec2} from "./control";
import {move, Vec2} from "@leela/common";
import EventEmitter = Phaser.Events.EventEmitter;
import UPDATE = Phaser.Scenes.Events.UPDATE;
import {getDirection} from "./direction";
import {CLIENT_PREDICT} from "../constants/config";

export default class MoveSystem {

    private events: EventEmitter;

    private readonly keys: Keys;

    private readonly tmpVec2: Vec2;

    constructor(private scene: GameScene) {
        this.events = scene.events;

        this.keys = scene.keys;

        this.tmpVec2 = {x: 0, y: 0};

        this.init();
    }

    private init() {
        this.events.on(UPDATE, (time: number, delta: number) => {
            const player = this.scene.player;
            if (player) {
                const dir = toVec2(this.keys, this.tmpVec2);

                let pos: Vec2;
                if (dir.x != 0 || dir.y != 0) {
                    pos = move(player, dir, delta / 1000, this.tmpVec2);
                } else {
                    pos = player;
                }

                this.scene.moveChar(player, pos.x, pos.y);
            }
        });
    }
}
