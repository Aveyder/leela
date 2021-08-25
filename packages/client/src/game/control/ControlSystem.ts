import GameScene from "../GameScene";
import Key = Phaser.Input.Keyboard.Key;
import InputPlugin = Phaser.Input.InputPlugin;
import SimulationSystem from "../../network/SimulationSystem";
import {CHAR_SPEED, clampBoundaries, Opcode, PlayerId, TICK} from "@leela/common";
import OutgoingSystem from "../../network/OutgoingSystem";
import {ReconcileSystem} from "../../network/reconcile";
import Vector2Like = Phaser.Types.Math.Vector2Like;
import {MOVEMENT} from "../../constants/keys";
import Sprite = Phaser.GameObjects.Sprite;
import UPDATE = Phaser.Scenes.Events.UPDATE;
import {makeLogger} from "ts-loader/dist/logger";

interface ArrowKeys {
    up: Key,
    down: Key,
    left: Key,
    right: Key
}

export default class ControlSystem {

    private readonly input: InputPlugin;

    private readonly simulations: SimulationSystem;
    private readonly outgoing: OutgoingSystem;
    private readonly reconciliation: ReconcileSystem;

    private readonly chars: Record<PlayerId, Sprite>;

    private keys: ArrowKeys;

    constructor(private readonly scene: GameScene) {
        this.input = scene.input;

        this.simulations = scene.network.simulations;
        this.outgoing = scene.network.outgoing;
        this.reconciliation = scene.network.reconciliation;

        this.chars = scene.chars;

        this.init();
    }

    private init() {
        this.keys = this.input.keyboard.addKeys({
            up: "up",
            down: "down",
            left: "left",
            right: "right",
        }) as ArrowKeys;

        this.reconciliation.register<Vector2Like>(MOVEMENT, {
            sum: (p1, p2) => {
                return {
                    x: p1.x + p2.x,
                    y: p1.y + p2.y
                };
            },
            diff: (p1, p2) => {
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;

                if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
                    return {x: dx, y: dy};
                }
            },
            mul: (p1, scalar) => {
                return {x: p1.x * scalar, y: p1.y * scalar};
            },
            eq: (p1, p2) => p1.x == p2.x && p1.y == p2.y
        });

        this.simulations.events.on(TICK, (delta: number) => {
            this.update(delta);
        });

        this.scene.events.on(UPDATE, (time: number, delta: number) => {
            this.updatePredicted(delta);
        });
    }

    private update(delta: number) {
        const playerId = this.scene.playerId;
        const player = this.chars[playerId] as Sprite;

        if (player) {
            let vx = 0;
            let vy = 0;

            if (this.keys.down.isDown) {
                vy += 1;
            }
            if (this.keys.up.isDown) {
                vy -= 1;
            }
            if (this.keys.right.isDown) {
                vx += 1;
            }
            if (this.keys.left.isDown) {
                vx -= 1;
            }

            if (vx || vy) {
                this.outgoing.push(Opcode.Move, [vx, vy]);
            }
        }
    }

    private updatePredicted(delta: number) {
        const playerId = this.scene.playerId;
        const player = this.chars[playerId] as Sprite;

        if (player) {
            let vx = 0;
            let vy = 0;

            if (this.keys.down.isDown) {
                vy += 1;
            }
            if (this.keys.up.isDown) {
                vy -= 1;
            }
            if (this.keys.right.isDown) {
                vx += 1;
            }
            if (this.keys.left.isDown) {
                vx -= 1;
            }

            const predictedPos = {
                x: player.x + vx * CHAR_SPEED * delta / 1000,
                y: player.y + vy * CHAR_SPEED * delta / 1000
            };

            clampBoundaries(predictedPos);

            const reconciled = this.reconciliation.reconcile<Vector2Like>(MOVEMENT, predictedPos, delta / 1000);

            player.x = reconciled.x;
            player.y = reconciled.y;
        }
    }
}
