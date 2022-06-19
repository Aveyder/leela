import {Vec2} from "@leela/common";
import Char from "./view/Char";
import {getDirection} from "../direction";

export default class WalkSystem {

    public char(char: Char, dir: Vec2): void {
        const direction = getDirection(dir);

        char.walk(direction);
    }
}
