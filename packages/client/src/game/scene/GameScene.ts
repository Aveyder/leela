import PreloaderSystem from "./PreloaderSystem";
import {Keys} from "../types";
import Char from "./view/Char";
import PlayerControlSystem from "./PlayerControlSystem";
import {Vec2} from "@leela/common";
import MovementSystem from "./MovementSystem";
import SpawnSystem from "./SpawnSystem";

export default class GameScene extends Phaser.Scene {

    public keys: Keys;

    public player: Char;

    public spawn: SpawnSystem;
    public move: MovementSystem;
    public control: PlayerControlSystem;

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

        this.spawn = new SpawnSystem(this);
        this.move = new MovementSystem();
        this.control = new PlayerControlSystem(this);
    }
}
