import Char from "../world/view/Char";
import {Vec2} from "@leela/common";
import WalkSystem from "../world/WalkSystem";
import Controller from "./Controller";

export default class MovementSystem {

    private readonly walk: WalkSystem;

    private readonly tmpVec2: Vec2;

    constructor(private readonly controller: Controller) {
        this.walk = this.controller.worldScene.walk;

        this.tmpVec2 = {x: 0, y: 0};
    }

    public char(char: Char, x: number, y: number) {
        this.tmpVec2.x = x - char.x;
        this.tmpVec2.y = y - char.y;

        this.walk.char(char, x, y);

        char.setPosition(x, y);
    }
}