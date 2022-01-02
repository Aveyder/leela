import PreloaderSystem from "./preload/PreloaderSystem";
import {Keys} from "./types";
import Char from "./view/Char";
import MoveSystem from "./MoveSystem";
import {SkinId, Vec2} from "@leela/common";
import {bound} from "@leela/common";
import {getDirection} from "./direction";
import {CLIENT_PREDICT} from "../constants/config";

export default class GameScene extends Phaser.Scene {

    public keys: Keys;
    public player: Char;

    public move: MoveSystem;

    private readonly tmpVec2: Vec2;

    constructor() {
        super("game");

        this.tmpVec2 = {x: 0, y: 0};
    }

    preload(): void {
        const preloader = new PreloaderSystem(this);
        preloader.preload();
    }

    create(): void {
        this.keys = this.input.keyboard.addKeys("W,A,S,D,up,left,down,right") as Keys;

        this.move = new MoveSystem(this);
    }

    public spawnChar(skin: SkinId, x?: number, y?: number): Char {
        const char = new Char(this, skin, x, y);

        bound(char);

        this.add.existing(char);

        return char;
    }

    public moveChar(char: Char, x: number, y: number): void {
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

    public destroyChar(char: Char): void {
        char.destroy();
    }
}
