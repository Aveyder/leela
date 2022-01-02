import NetworkSystem from "../network/NetworkSystem";
import GameScene from "./GameScene";
import {Game} from "phaser";
import {CHAR_SPEED, Data, EntityId, move, Opcode, SkinId, TICK, toFixed, Vec2} from "@leela/common";
import {toVec2} from "./control";
import {ENTITY_ID, MOVEMENT} from "../constants/keys";
import Char from "./view/Char";
import Interpolation, {Equals} from "../network/interpolation/Interpolation";
import {Interpolator} from "../network/interpolation/interpolate";
import Sequence from "../network/reconcile/Sequence";
import {
    CLIENT_PREDICT,
    CLIENT_SMOOTH,
    CLIENT_SMOOTH_MAX_MS,
    CLIENT_SMOOTH_PRECISION,
    CLIENT_SNAP_RATIO, INTERPOLATE
} from "../constants/config";
import UPDATE = Phaser.Scenes.Events.UPDATE;

const posInterpolator: Interpolator<Vec2> = (s1, s2, progress: number) => {
    const x = s1.x + (s2.x - s1.x) * progress;
    const y = s1.y + (s2.y - s1.y) * progress;

    return {x, y};
};

const posEquals: Equals<Vec2> = (s1, s2) => {
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
                this.errorTimer = 0;
            }
        });

        this.network.reconciliation.sequences[MOVEMENT] = new Sequence<Vec2, Vec2>(move);

        this.network.simulations.events.on(TICK, (delta: number) => {
            if (this.playerId != undefined) {
                const dir = toVec2(this.gameScene.keys, this.tmpVec2);

                if (dir.x != 0 || dir.y != 0) {
                    this.network.outgoing.push(Opcode.Move, [dir.x, dir.y]);
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

        this.network.interpolations.map[MOVEMENT] = new Interpolation<Vec2>(posInterpolator, posEquals);

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

                    const char = this.chars[entityId];

                    if (INTERPOLATE) {
                        this.network.interpolations.push(MOVEMENT, entityId, pos);
                    } else {
                        this.gameScene.moveChar(char, x, y);
                    }
                } else {
                    const player = this.chars[entityId];

                    if (CLIENT_PREDICT) {
                        const rec = this.network.reconciliation.reconcile(MOVEMENT, pos);

                        if (CLIENT_SMOOTH) {
                            const errX = Math.abs(rec.x - player.x);
                            const errY = Math.abs(rec.y - player.y);

                            if (errX > CLIENT_SMOOTH_PRECISION || errY > CLIENT_SMOOTH_PRECISION) {
                                if (errX > CHAR_SPEED * CLIENT_SNAP_RATIO || errY > CHAR_SPEED * CLIENT_SNAP_RATIO) {
                                    this.gameScene.moveChar(player, rec.x, rec.y);
                                    this.error = null;
                                    this.errorTimer = 0;
                                } else {
                                    if (this.error?.x != rec.x || this.error?.y != rec.y) {
                                        this.error = rec;
                                    }
                                    this.errorTimer = 0;
                                }
                            }
                        } else {
                            this.gameScene.moveChar(player, rec.x, rec.y);
                        }
                    } else {
                        this.gameScene.moveChar(player, x, y);
                    }
                }
            }
        });

        this.gameScene.events.on(UPDATE, (time: number, delta: number) => {
            if (this.playerId != undefined) {
                if (CLIENT_PREDICT && this.gameScene.keys) {
                    const dirVec = toVec2(this.gameScene.keys);

                    this.network.reconciliation.push(MOVEMENT, dirVec, delta / 1000);
                }

                if (this.error) {
                    const player = this.chars[this.playerId];

                    const r = this.errorTimer / CLIENT_SMOOTH_MAX_MS;
                    const weight = Math.min(1 - Math.pow(1 - r, 5), 1);

                    player.setPosition(
                        toFixed(player.x * (1 - weight) + this.error.x * weight, 3),
                        toFixed(player.y * (1 - weight) + this.error.y * weight, 3)
                    );

                    this.errorTimer += delta;

                    const offsetX = player.x - this.error.x;
                    const offsetY = player.y - this.error.y;

                    if (Math.abs(offsetX) < CLIENT_SMOOTH_PRECISION && Math.abs(offsetY) < CLIENT_SMOOTH_PRECISION) {
                        this.error = null;
                        this.errorTimer = 0;
                    }
                }
            }

            Object.keys(this.chars).forEach(entityId => {
                const char = this.chars[entityId];

                const charId = char.getData(ENTITY_ID) as number;

                if (INTERPOLATE && charId != this.playerId) {
                    const pos = this.network.interpolations.interpolate<Vec2>(MOVEMENT, charId);

                    if (pos) this.gameScene.moveChar(char, pos.x, pos.y);
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
