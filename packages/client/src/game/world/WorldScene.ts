import PreloaderSystem from "./PreloaderSystem";
import {Keys} from "../types";
import MovementSystem from "./MovementSystem";
import SpawnSystem from "./SpawnSystem";

export default class WorldScene extends Phaser.Scene {

    public keys: Keys;

    public spawn: SpawnSystem;
    public move: MovementSystem;

    constructor() {
        super("world");
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
