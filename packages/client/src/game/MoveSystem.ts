import {Keys} from "./types";
import GameScene from "./GameScene";
import {toVec2} from "./control";
import {move, Vec2} from "@leela/common";
import EventEmitter = Phaser.Events.EventEmitter;
import UPDATE = Phaser.Scenes.Events.UPDATE;
import {getDirection} from "./direction";

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
            if (this.scene.player) {
                const player = this.scene.player;

                const dirVec = toVec2(this.keys, this.tmpVec2);

                if (dirVec.x === 0 && dirVec.y === 0) {
                    player.stay();
                } else {
                    const dir = getDirection(dirVec);

                    player.walk(dir);

                    move(player, dirVec, delta / 1000);
                }
            }
        });
    }
}
