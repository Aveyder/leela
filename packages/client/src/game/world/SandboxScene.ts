import {Keys} from "../types";
import {bound, CHAR_SIZE, CHAR_SPEED, TILE_SIZE, TILES_HEIGHT, TILES_WIDTH, Vec2} from "@leela/common";
import {toVec2} from "../control";
import UPDATE = Phaser.Input.Events.UPDATE;
import Graphics = Phaser.GameObjects.Graphics;

export default class SandboxScene extends Phaser.Scene {

    public keys: Keys;

    private map: number[];

    private graphics: Graphics;

    private char: Vec2;
    private charTile: Vec2
    private collisionArea: Vec2;

    constructor() {
        super("sandbox");
    }

    public create(): void {
        this.keys = this.input.keyboard.addKeys("W,A,S,D,up,left,down,right") as Keys;

        this.map = [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        ];

        this.graphics = this.add.graphics();

        this.char = {x: 6.5 * TILE_SIZE, y: 6.5 * TILE_SIZE};
        this.charTile = {x: 0, y: 0};
        this.collisionArea = {x: 0, y: 0};

        const tmpVec2 = {x: 0, y: 0};

        this.events.on(UPDATE, (time, delta) => {
            const dir = toVec2(this.keys, tmpVec2);
            this.char.x += dir.x * CHAR_SPEED * delta / 1000;
            this.char.y += dir.y * CHAR_SPEED * delta / 1000;

            bound(this.char, this.char);

            this.detectCollision();

            this.graphics.clear();
            this.drawMap();
            this.highlightTiles();
            this.drawChar();
        });
    }

    private detectCollision() {
        this.charTile.x = Math.floor(this.char.x / TILE_SIZE);
        this.charTile.y = Math.floor(this.char.y / TILE_SIZE);

        this.collisionArea.x = this.charTile.x - 1;
        this.collisionArea.y = this.charTile.y - 1;

        const detectAndRespond = (x: number, y: number) => {
            const tile = this.getTile(x, y);

            if (tile == 1) {
                const xOverlaps = (x * TILE_SIZE < this.char.x + CHAR_SIZE / 2) && (x * TILE_SIZE + TILE_SIZE > this.char.x - CHAR_SIZE / 2);
                const yOverlaps = (y * TILE_SIZE < this.char.y + CHAR_SIZE / 2) && (y * TILE_SIZE + TILE_SIZE > this.char.y - CHAR_SIZE / 2);

                if (xOverlaps && yOverlaps) {
                    const tilePosX = x * TILE_SIZE + TILE_SIZE / 2;
                    const tilePosY = y * TILE_SIZE + TILE_SIZE / 2;

                    const xVec = this.char.x - tilePosX;
                    const yVec = this.char.y - tilePosY;

                    if (Math.abs(xVec) > Math.abs(yVec)) {
                        if (xVec > 0) {
                            this.char.x = tilePosX + TILE_SIZE;
                        } else {
                            this.char.x = tilePosX - TILE_SIZE;
                        }
                    } else {
                        if (yVec > 0) {
                            this.char.y = tilePosY + TILE_SIZE;
                        } else {
                            this.char.y = tilePosY - TILE_SIZE;
                        }
                    }
                }
            }
        }

        for(let i = 1; i < 9; i += 2) {
            const y = Math.floor(i / 3);
            const x = i % 3;

            detectAndRespond(this.collisionArea.x + x, this.collisionArea.y + y);
        }

        for(let i = 0; i < 9; i += 2) {
            const y = Math.floor(i / 3);
            const x = i % 3;

            detectAndRespond(this.collisionArea.x + x, this.collisionArea.y + y);
        }
    }

    private drawMap() {
        for(let y = 0; y < TILES_HEIGHT; y++) {
            for(let x = 0; x < TILES_WIDTH; x++) {
                const tile = this.getTile(x, y);

                this.graphics.lineStyle(1, 0xffffff, 0.1);
                this.graphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                if (tile == 1) {
                    this.graphics.fillStyle(0x6b2343);
                    this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    private drawChar() {
        this.graphics.lineStyle(1, 0xffcc00);
        this.graphics.fillStyle(0xeede8f);

        this.graphics.fillRect(this.char.x - CHAR_SIZE / 2, this.char.y - CHAR_SIZE / 2, CHAR_SIZE, CHAR_SIZE);
        this.graphics.strokeRect(this.char.x - CHAR_SIZE / 2, this.char.y - CHAR_SIZE / 2, CHAR_SIZE, CHAR_SIZE);
    }

    private highlightTiles() {
        this.graphics.fillStyle(0xffffff, 0.3);
        this.graphics.fillRect(this.charTile.x * TILE_SIZE, this.charTile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        this.graphics.lineStyle(2, 0xffffff, 0.65);
        this.graphics.strokeRect(this.collisionArea.x * TILE_SIZE, this.collisionArea.y * TILE_SIZE,
            3 * TILE_SIZE, 3 * TILE_SIZE);
    }

    private getTile(x: number, y: number) {
        return this.map[y * TILES_WIDTH + x];
    }
}
