import PreloaderSystem from "./preload/PreloaderSystem";
import {Keys} from "./types";
import Char from "./view/Char";
import MoveSystem from "./MoveSystem";
import {SkinId} from "@leela/common";
import {bound} from "@leela/common";

export default class GameScene extends Phaser.Scene {

    public keys: Keys;
    public player: Char;

    public move: MoveSystem;

    constructor() {
        super("game");
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

    public destroyChar(char: Char): void {
        char.destroy();
    }
}
