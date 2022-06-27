import {Body} from "@leela/common";
import Transform = Phaser.GameObjects.Components.Transform;

export default class PhysBody implements Body {

    public readonly gameObject: Transform;

    public vx: number;
    public vy: number;
    public width: number;
    public height: number;
    public bullet: boolean;

    constructor(gameObject: Transform) {
        this.gameObject = gameObject;

        this.vx = 0;
        this.vy = 0;
        this.width = 0;
        this.height = 0;
        this.bullet = false;
    }

    public get x() {
        return this.gameObject.x;
    }

    public set x(value: number) {
        this.gameObject.x = value;
    }

    public get y() {
        return this.gameObject.y;
    }

    public set y(value: number) {
        this.gameObject.y = value;
    }
}