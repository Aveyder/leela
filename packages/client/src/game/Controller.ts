import NetworkSystem from "../network/NetworkSystem";
import GameScene from "./GameScene";
import {Game} from "phaser";
import {CHAR_SPEED, Data, EntityId, move, Opcode, SkinId, TICK, Vec2, WORLD_WIDTH} from "@leela/common";
import {toVec2} from "./control";
import {ENTITY_ID, MOVEMENT} from "../constants/keys";
import Char from "./view/Char";
import Interpolation, {Equalizer} from "../network/interpolation/Interpolation";
import {Interpolator} from "../network/interpolation/interpolate";
import Sequence from "../network/reconcile/Sequence";
import {getDirection} from "./direction";
import UPDATE = Phaser.Scenes.Events.UPDATE;
import {CLIENT_SMOOTH, CLIENT_SMOOTH_MAX_MS, CLIENT_SMOOTH_PRECISION, CLIENT_SNAP_RATIO} from "../constants/config";

const posInterpolator: Interpolator<Vec2> = (s1, s2, progress: number) => {
      const x = s1.x + (s2.x - s1.x) * progress;
      const y = s1.y + (s2.y - s1.y) * progress;

      return {x, y};
};

const posEqualizer: Equalizer<Vec2> = (s1, s2) => {
    return s1.x == s2.x && s1.y == s2.y;
}

export default class Controller {

    private readonly gameScene: GameScene;

    private playerId: EntityId;

    private chars: Record<EntityId, Char>;

    private tmpVec2: Vec2;

    private error: Vec2;
    private errorTimer: number;

    constructor(
        private readonly network: NetworkSystem,
        private readonly game: Game
    ) {
        this.gameScene = game.scene.getScene("game") as GameScene;

        this.chars = {};

        this.tmpVec2 = {x: 0, y: 0};

        this.errorTimer = 0;

        this.init();
    }

    private init() {
        this.network.socket.on("disconnect", () => {
            if (this.playerId != undefined) {
                this.gameScene.destroyChar(this.chars[this.playerId]);
                this.playerId = null;
                this.error = null;
            }
        });

        this.network.reconciliation.sequences[MOVEMENT] = new Sequence<Vec2, Vec2>(move);

        this.network.simulations.events.on(TICK, (delta: number) => {
            if (this.playerId != undefined) {
                const dirVec = toVec2(this.gameScene.keys);

                if (dirVec.x != 0 || dirVec.y != 0) {
                    this.network.outgoing.push(Opcode.Move, [dirVec.x, dirVec.y]);
                }
            }
        });

        this.network.messages.on(Opcode.JoinResponse, (data: Data) => {
            const entityId = data[0] as EntityId;
            const x = data[1] as number;
            const y = data[2] as number;
            const skin = data[3] as SkinId;

            this.playerId = entityId;

            this.gameScene.player = this.spawnChar(entityId, x, y, skin);
        });

        this.network.outgoing.push(Opcode.JoinRequest);

        this.network.messages.on(Opcode.Disappear, (data: Data) => {
            const entityId = data[0] as EntityId;

            const char = this.chars[entityId];
            if (char) {
                this.gameScene.destroyChar(char);
            }
        });

        this.network.interpolations.map[MOVEMENT] = new Interpolation<Vec2>(posInterpolator, posEqualizer);

        this.network.messages.on(Opcode.Snapshot, (data: Data) => {
            for (let i = 0; i < data.length; i += 4) {
                const entityId = data[i] as EntityId;
                const x = data[i + 1] as number;
                const y = data[i + 2] as number;
                const skin = data[i + 3] as SkinId;

                const pos = {x, y};

                if (entityId != this.playerId) {
                    if (!this.chars[entityId]) {

                        this.spawnChar(entityId, x, y, skin);
                    }

                    this.network.interpolations.push(MOVEMENT, entityId, pos);
                } else {
                    const player = this.chars[entityId];

                    const rec = this.network.reconciliation.reconcile(MOVEMENT, pos);

                    if (CLIENT_SMOOTH) {
                        const errX = Math.abs(rec.x - player.x);
                        const errY = Math.abs(rec.y - player.y);

                        if ((errX > CLIENT_SMOOTH_PRECISION || errY > CLIENT_SMOOTH_PRECISION)) {
                            if (!this.error || (this.error.x != rec.x || this.error.y != rec.y)) {
                                this.error = rec;
                                console.log(`ERR ${errX} ${errY}`);
                            }
                            this.errorTimer = 0;
                        }

                        if (errX > CHAR_SPEED * CLIENT_SNAP_RATIO || errY > CHAR_SPEED * CLIENT_SNAP_RATIO) {
                            player.setPosition(rec.x, rec.y);
                            this.error = null;
                            this.errorTimer = 0;
                        }
                    } else {
                        player.setPosition(rec.x, rec.y);
                    }
                }
            }
        });

        this.gameScene.events.on(UPDATE, (time: number, delta: number) => {
            if (this.playerId != undefined) {
                if (this.gameScene.keys) {
                    const dirVec = toVec2(this.gameScene.keys);

                    this.network.reconciliation.push(MOVEMENT, dirVec, delta / 1000);
                }

                if (this.error) {
                    const player = this.chars[this.playerId];

                    const r = this.errorTimer / CLIENT_SMOOTH_MAX_MS;
                    const weight = Math.min(1 - Math.pow(1 - r, 5), 1);

                    player.x = player.x * (1 - weight) + this.error.x * weight;
                    player.y = player.y * (1 - weight) + this.error.y * weight;

                    this.errorTimer += delta;

                    const offsetX = player.x - this.error.x;
                    const offsetY = player.y - this.error.y;

                    if (Math.abs(offsetX) < CLIENT_SMOOTH_PRECISION && Math.abs(offsetY) < CLIENT_SMOOTH_PRECISION) {
                        this.error = null;
                        console.log(`ERS: ${this.errorTimer}`);
                        this.errorTimer = 0;
                    }
                }
            }

            Object.keys(this.chars).forEach(entityId => {
                const char = this.chars[entityId];

                const charId = char.getData(ENTITY_ID) as number;

                if (charId != this.playerId) {
                    const pos = this.network.interpolations.interpolate<Vec2>(MOVEMENT, charId);

                    if (pos) {
                        if (char.x != pos.x || char.y != pos.y) {
                            this.tmpVec2.x = Math.sign(pos.x - char.x);
                            this.tmpVec2.y = Math.sign(pos.y - char.y);

                            const dir = getDirection(this.tmpVec2);

                            char.walk(dir);

                            char.setPosition(pos.x, pos.y);
                        } else {
                            char.stay();
                        }
                    }
                }
            });
        });
    }

    private spawnChar(entityId: EntityId, x, y, skin: SkinId) {
        const char = this.gameScene.spawnChar(skin, x, y);
        char.setData(ENTITY_ID, entityId);

        this.chars[entityId] = char;

        return char;
    }
}
