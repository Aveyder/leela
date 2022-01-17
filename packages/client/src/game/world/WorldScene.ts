import PreloaderSystem from "./PreloaderSystem";
import {Keys} from "../types";
import Char from "./view/Char";
import {Vec2} from "@leela/common";
import MovementSystem from "./MovementSystem";
import SpawnSystem from "./SpawnSystem";

export default class WorldScene extends Phaser.Scene {

    public keys: Keys;

    public player: Char;

    public spawn: SpawnSystem;
    public move: MovementSystem;

    private readonly tmpVec2: Vec2;

    constructor() {
        super("world");

        this.tmpVec2 = {x: 0, y: 0};
    }

    public preload(): void {
        const preloader = new PreloaderSystem(this);
        preloader.preload();
    }

    public create(): void {
        this.keys = this.input.keyboard.addKeys("W,A,S,D,up,left,down,right") as Keys;

        this.spawn = new SpawnSystem(this);
        this.move = new MovementSystem();
    }
}
