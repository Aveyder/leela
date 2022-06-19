import Sprite = Phaser.GameObjects.Sprite;
import {Scene} from "phaser";
import {Direction} from "../../direction";

export default class Char extends Sprite {

    private _skin: number;
    private dir: Direction;

    constructor(scene: Scene, skin = 0, x?: number, y?: number) {
        super(scene, x, y, "char:0");

        this.skin = skin;
    }

    public set skin(value: number) {
        this._skin = value;
        this.setTexture(`char:${this._skin}`);
        if (this.dir) {
            this.play(this.dir);
        }
    }

    public walk(dir: Direction):void {
        this.dir = dir;

        if (this.dir == Direction.NONE) {
            this._stay();
        } else {
            this._walk();
        }
    }

    private _stay() {
        this.anims.pause();
        this.setFrame(1);
    }

    private _walk() {
        const anim = `char:${this._skin}:walk:${this.dir}`;
        if (this.anims.currentAnim?.key == anim) {
            this.anims.resume();
        } else {
            this.play(anim);
        }
    }
}
