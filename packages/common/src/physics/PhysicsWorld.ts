import Body from "./Body";
import {Vec2} from "../utils/math";
import {SIMULATION_DELTA} from "../config";
import TileMap from "./TileMap";

export default class PhysicsWorld {

    private static readonly EMPTY_TILE = 0;

    public readonly map: TileMap;

    public readonly tileSize: number;

    public readonly boundTop: number;
    public readonly boundRight: number;
    public readonly boundBottom: number;
    public readonly boundLeft: number;

    private static readonly COLLISION_AREA_PASS_ORDER = [
        {dx: 0, dy: 0},
        {dx: 0, dy: -1},
        {dx: -1, dy: 0},
        {dx: 1, dy: 0},
        {dx: 0, dy: 1},
        {dx: -1, dy: -1},
        {dx: 1, dy: -1},
        {dx: -1, dy: 1},
        {dx: 1, dy: 1}
    ];

    private static readonly MOVE_STEPS = 5;
    private static readonly BULLET_MOVE_STEPS = 20;

    constructor(map: TileMap) {
        this.map = map;

        this.tileSize = map.tileSize;

        this.boundTop = this.tileSize;
        this.boundRight = this.tileSize * (map.tilesWidth - 1);
        this.boundBottom = this.tileSize * (map.tilesHeight - 1);
        this.boundLeft = this.tileSize;
    }

    public move(body: Body, dir: Vec2, speed: number) {
        if (dir.x == 0 && dir.y == 0) {
            body.vx = body.vy = 0;
            return;
        }

        const angle = Math.atan2(dir.y, dir.x);

        body.vx = Math.cos(angle) * speed * SIMULATION_DELTA;
        body.vy = Math.sin(angle) * speed * SIMULATION_DELTA;

        const moveSteps = body.bullet ? PhysicsWorld.BULLET_MOVE_STEPS : PhysicsWorld.MOVE_STEPS;

        for(let i = 0; i < moveSteps; i++) {
            body.x += body.vx / moveSteps;
            body.y += body.vy / moveSteps;

            this.collideAndRespond(body);
        }
    }

    public collideAndRespond(body: Body): void {
        const boundTop = this.boundTop + body.height / 2;
        if (body.y < boundTop) body.y = boundTop;
        const boundRight = this.boundRight - body.width / 2;
        if (body.x > boundRight) body.x = boundRight;
        const boundBottom = this.boundBottom - body.height / 2;
        if (body.y > boundBottom) body.y = boundBottom;
        const boundLeft = this.boundLeft + body.width / 2;
        if (body.x < boundLeft) body.x = boundLeft;

        const bodyTileX = Math.floor(body.x / this.tileSize);
        const bodyTileY = Math.floor(body.y / this.tileSize);

        const passOrder = PhysicsWorld.COLLISION_AREA_PASS_ORDER;
        for(let i = 0; i < passOrder.length; i++) {
            const locator = passOrder[i];

            const tx = bodyTileX + locator.dx;
            const ty = bodyTileY + locator.dy;

            const tile = this.getTile(tx, ty);

            if (tile != PhysicsWorld.EMPTY_TILE && this.collidesWithTile(body, tx, ty)) {
                this.respond(body, tx, ty);
            }
        }
    }

    private respond(body: Body, tx: number, ty: number) {
        const tilePosX = tx * this.tileSize + this.tileSize / 2;
        const tilePosY = ty * this.tileSize + this.tileSize / 2;

        const dx = body.x - tilePosX;
        const dy = body.y - tilePosY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                body.x = tilePosX + this.tileSize / 2 + body.width / 2;
            } else {
                body.x = tilePosX - this.tileSize / 2 - body.width / 2;
            }
        } else {
            if (dy > 0) {
                body.y = tilePosY + this.tileSize / 2 + body.height / 2;
            } else {
                body.y = tilePosY - this.tileSize / 2 - body.height / 2;
            }
        }
    }

    private collidesWithTile(body: Body, tx: number, ty: number) {
        const xAxis = (tx * this.tileSize < body.x + body.width / 2) && (tx * this.tileSize + this.tileSize > body.x - body.width / 2);
        const yAxis = (ty * this.tileSize < body.y + body.height / 2) && (ty * this.tileSize + this.tileSize > body.y - body.height / 2);

        return xAxis && yAxis;
    }

    private getTile(tx: number, ty: number): number {
        return this.map.data[ty * this.map.tilesWidth + tx];
    }
}
