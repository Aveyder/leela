import Graphics = Phaser.GameObjects.Graphics;
import {Scene} from "phaser";

export default class Slot extends Graphics {

    public static readonly SIZE = 32;

    constructor(scene: Scene, ) {
        super(scene);

        this.fillStyle(0x000000, 0.5);
        this.fillRect(-Slot.SIZE / 2, -Slot.SIZE / 2, Slot.SIZE,  Slot.SIZE);

        this.lineStyle(1, 0x000000, 0.85);
        this.strokeRect(-Slot.SIZE / 2 + 1, -Slot.SIZE / 2 + 1, Slot.SIZE - 2, Slot.SIZE - 2);

        this.lineStyle(1, 0xEAEAEA);
        this.strokeRect(-Slot.SIZE / 2, -Slot.SIZE / 2, Slot.SIZE,  Slot.SIZE);
    }
}
