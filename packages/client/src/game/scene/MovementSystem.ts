import {Vec2} from "@leela/common";
import Char from "./view/Char";
import {getDirection} from "../direction";

export default class MovementSystem {

    private readonly tmpVec2: Vec2;

    constructor() {
        this.tmpVec2 = {x: 0, y: 0};
    }

    public char(char: Char, x: number, y: number): void {
        if (char.x == x && char.y == y) {
            char.stay();
        } else {
            this.tmpVec2.x = Math.sign(x - char.x);
            this.tmpVec2.y = Math.sign(y - char.y);

            const dir = getDirection(this.tmpVec2);

            char.walk(dir);

            char.setPosition(x, y);
        }
    }
}
