import PreloaderSystem from "./PreloaderSystem";
import {Keys} from "../types";
import Char from "./view/Char";
import PlayerControlSystem from "./PlayerControlSystem";
import {Vec2} from "@leela/common";
import MovementSystem from "./MovementSystem";
import SpawnSystem from "./SpawnSystem";
import {CLIENT_PREDICT} from "../../constants/config";

export default class WorldScene extends Phaser.Scene {

    public keys: Keys;

    public player: Char;

    public spawn: SpawnSystem;
    public move: MovementSystem;
    public control: PlayerControlSystem;

    private readonly tmpVec2: Vec2;

    constructor() {
        super("world");

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
        if (CLIENT_PREDICT) {
            this.control = new PlayerControlSystem(this);
        }
    }
}
