import World from "../../world/World";
import {Unit} from "../Unit";
import {Type} from "@leela/common";

export default class Mob implements Unit {
    public guid: number;
    public typeId: number;
    public skin: number;
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public moveProgress: number;
    public moveShift: number;
    public moveS: number;

    public readonly world: World;

    constructor(world: World) {
        this.world = world;

        this.typeId = Type.MOB;
    }
}
