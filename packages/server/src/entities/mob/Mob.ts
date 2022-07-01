import World from "../../world/World";
import {Unit} from "../Unit";
import {Type, UNIT_BODY_HEIGHT, UNIT_BODY_WIDTH} from "@leela/common";
import {Motion} from "../../motion/motions";

export default class Mob implements Unit {
    public guid: number;
    public typeId: number;
    public skin: number;
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public readonly width: number;
    public readonly height: number;
    public readonly bullet: boolean;
    public motion: Motion;

    public readonly world: World;

    constructor(world: World) {
        this.world = world;

        this.typeId = Type.MOB;
        this.width = UNIT_BODY_WIDTH;
        this.height = UNIT_BODY_HEIGHT;
        this.bullet = false;
    }
}
