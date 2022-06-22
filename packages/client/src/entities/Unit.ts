import Sprite = Phaser.GameObjects.Sprite;
import {Scene} from "phaser";
import {Direction, getDirection} from "../movement/direction";
import {Unit as UnitState, Vec2} from "@leela/common";

interface UnitUpdate {
    state: UnitState,
    timestamp: number
}

export default class Unit extends Sprite implements UnitState {

    private _skin = 0;
    public guid: number;
    public typeId: number;
    private _vx = 0;
    private _vy = 0;
    private dir = Direction.NONE;

    public remotePos: Vec2;

    public readonly updateBuffer: UnitUpdate[];

    private readonly tmpVec2: Vec2;

    constructor(scene: Scene, skin = 0, x?: number, y?: number) {
        super(scene, x, y, "unit:0");

        this.tmpVec2 = {x: 0, y: 0};

        this.dir = Direction.NONE;

        this.skin = skin;

        this.remotePos = {x: 0, y: 0};

        this.updateBuffer = [];
    }

    public set skin(value: number) {
        this._skin = value;
        this.setTexture(`unit:${this._skin}`);
        this.updateDir();
    }

    public get vx() {
        return this._vx;
    }

    public get vy() {
        return this._vy;
    }

    public setDir(vx: number, vy: number) {
        this._vx = vx;
        this._vy = vy;

        this.updateDir();
    }

    private updateDir() {
        this.tmpVec2.x = this._vx;
        this.tmpVec2.y = this._vy;

        this.dir = getDirection(this.tmpVec2);

        if (this.dir == Direction.NONE) {
            this.stay();
        } else {
            this.walk();
        }
    }

    private stay() {
        this.anims.pause();
        this.setFrame(1);
    }

    private walk() {
        const anim = `unit:${this._skin}:walk:${this.dir}`;
        if (this.anims.currentAnim?.key == anim) {
            this.anims.resume(this.anims.currentFrame);
        } else {
            this.play(anim);
        }
    }
}

export {
    UnitUpdate
}
