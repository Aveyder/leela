import NetworkSystem from "../network/NetworkSystem";
import PreloaderSystem from "./preload/PreloaderSystem";
import {Char, CHAR_SCALE, CHAR_SPEED, Data, deserializeSnapshot, Opcode, PlayerId} from "@leela/common";
import ControlSystem from "./control/ControlSystem";
import {MOVEMENT} from "../constants/keys";
import Vector2Like = Phaser.Types.Math.Vector2Like;
import Sprite = Phaser.GameObjects.Sprite;
import UPDATE = Phaser.Scenes.Events.UPDATE;


export default class GameScene extends Phaser.Scene {

    public network: NetworkSystem;

    public playerId: PlayerId;

    public chars: Record<PlayerId, Sprite>;

    public control: ControlSystem;

    constructor() {
        super("game");
    }

    preload(): void {
        const preloader = new PreloaderSystem(this);
        preloader.preload();
    }

    create(network: NetworkSystem): void {
        this.network = network;

        this.chars = {};

        this.control = new ControlSystem(this);

        this.network.interpolations.register<Vector2Like>(MOVEMENT, (p1, p2, progress) => {
            return {
                x: (p2.x - p1.x) * progress + p1.x,
                y: (p2.y - p1.y) * progress + p1.y
            };
        });

        this.network.socket.on("disconnect", () => {
            this.playerId = null;

            Object.keys(this.chars).forEach(playerId => {
                (this.chars[playerId] as Sprite).destroy();
            });

            this.network.interpolations.reset();
            this.network.reconciliation.reset();
        });

        this.network.messages.on(Opcode.JoinResponse, (data: [PlayerId]) => {
            this.playerId = data.shift();
        });

        this.network.messages.on(Opcode.Snapshot, (data: Data) => {
            const chars = deserializeSnapshot(data);

            console.log(`snapshot: ${JSON.stringify(data)}`);

            Object.keys(chars).forEach(playerId => {
                if (Number(playerId) != this.playerId) {
                    this.network.interpolations.pushState<Vector2Like>(MOVEMENT, playerId, chars[playerId]);
                } else {
                    this.network.reconciliation.ack<Vector2Like>(MOVEMENT, chars[playerId]);
                }

                const char = chars[playerId] as Char;

                let charSprite = this.chars[playerId] as Sprite;
                if (!charSprite) {
                    charSprite = this.add.sprite(char.x, char.y, `char${char.morph}`);
                    charSprite.setScale(CHAR_SCALE, CHAR_SCALE);
                    charSprite.play(`char:${char.morph}:walk:down`);

                    this.chars[playerId] = charSprite;
                }
            });
        });

        this.events.on(UPDATE, (time: number, delta: number) => {
            Object.keys(this.chars).forEach(playerId => {
                if (Number(playerId) != this.playerId) {
                    const char = this.chars[playerId] as Sprite;

                    const pos = this.network.interpolations.interpolate<Vector2Like>(MOVEMENT, playerId);

                    char.x = pos.x;
                    char.y = pos.y;
                }
            });
        });

        this.network.outgoing.push(Opcode.JoinRequest);
    }
}
