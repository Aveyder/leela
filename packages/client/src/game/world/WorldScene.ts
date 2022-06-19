import PreloaderSystem from "./PreloaderSystem";
import {Keys} from "../types";
import SpawnSystem from "./SpawnSystem";
import {PhysicsWorld, TILE_SIZE, TILES_HEIGHT, TILES_WIDTH} from "@leela/common";
import WalkSystem from "./WalkSystem";


export default class WorldScene extends Phaser.Scene {

    public keys: Keys;

    public spawn: SpawnSystem;
    public walk: WalkSystem;

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
        this.walk = new WalkSystem();
    }

    public drawMap(physics: PhysicsWorld) {
        const graphics = this.add.graphics();

        for(let y = 0; y < TILES_HEIGHT; y++) {
            for(let x = 0; x < TILES_WIDTH; x++) {
                const tile = physics.getTile(x, y);

                graphics.lineStyle(1, 0xffffff, 0.1);
                graphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                if (tile == 1) {
                    graphics.fillStyle(0x6b2343);
                    graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}
