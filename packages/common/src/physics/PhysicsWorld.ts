import {TILE_SIZE, TILES_WIDTH, WORLD_HEIGHT, WORLD_WIDTH} from "../constants/world";
import Body from "./Body";

export default class PhysicsWorld {

    private static readonly BLOCKER_TILE = 1;

    private static readonly BOUND_TOP = TILE_SIZE;
    private static readonly BOUND_RIGHT = WORLD_WIDTH - TILE_SIZE;
    private static readonly BOUND_BOTTOM = WORLD_HEIGHT - TILE_SIZE;
    private static readonly BOUND_LEFT = TILE_SIZE;

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

    constructor(private readonly map: number[]) {
    }

    public update(body: Body) {
        const moveSteps = body.bullet ? PhysicsWorld.BULLET_MOVE_STEPS : PhysicsWorld.MOVE_STEPS;

        for(let i = 0; i < moveSteps; i++) {
            body.x += body.vx / moveSteps;
            body.y += body.vy / moveSteps;

            this.collideAndRespond(body);
        }
    }

    public collideAndRespond(body: Body) {
        if (body.y < PhysicsWorld.BOUND_TOP) body.y = PhysicsWorld.BOUND_TOP + body.height / 2;
        if (body.x > PhysicsWorld.BOUND_RIGHT) body.x = PhysicsWorld.BOUND_RIGHT - body.height / 2;
        if (body.y > PhysicsWorld.BOUND_BOTTOM) body.y = PhysicsWorld.BOUND_BOTTOM - body.height / 2;
        if (body.x < PhysicsWorld.BOUND_LEFT) body.x = PhysicsWorld.BOUND_LEFT + body.height / 2;

        const bodyTileX = Math.floor(body.x / TILE_SIZE);
        const bodyTileY = Math.floor(body.y / TILE_SIZE);

        const passOrder = PhysicsWorld.COLLISION_AREA_PASS_ORDER;
        for(let i = 0; i < passOrder.length; i++) {
            const locator = passOrder[i];

            const tx = bodyTileX + locator.dx;
            const ty = bodyTileY + locator.dy;

            const tile = this.getTile(tx, ty);

            if (tile == PhysicsWorld.BLOCKER_TILE && this.collidesWithTile(body, tx, ty)) {
                this.respond(body, tx, ty);
            }
        }
    }

    private respond(body: Body, tx: number, ty: number) {
        const tilePosX = tx * TILE_SIZE + TILE_SIZE / 2;
        const tilePosY = ty * TILE_SIZE + TILE_SIZE / 2;

        const dx = body.x - tilePosX;
        const dy = body.y - tilePosY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                body.x = tilePosX + TILE_SIZE / 2 + body.width / 2;
            } else {
                body.x = tilePosX - TILE_SIZE / 2 - body.width / 2;
            }
        } else {
            if (dy > 0) {
                body.y = tilePosY + TILE_SIZE / 2 + body.height / 2;
            } else {
                body.y = tilePosY - TILE_SIZE / 2 - body.height / 2;
            }
        }
    }

    private collidesWithTile(body: Body, tx: number, ty: number) {
        const xAxis = (tx * TILE_SIZE < body.x + body.width / 2) && (tx * TILE_SIZE + TILE_SIZE > body.x - body.width / 2);
        const yAxis = (ty * TILE_SIZE < body.y + body.height / 2) && (ty * TILE_SIZE + TILE_SIZE > body.y - body.height / 2);

        return xAxis && yAxis;
    }

    public getTile(tx: number, ty: number) {
        return this.map[ty * TILES_WIDTH + tx];
    }
}
