import {BODY_HEIGHT, BODY_WIDTH, TILE_SIZE, TILES_WIDTH, WORLD_HEIGHT, WORLD_WIDTH} from "../constants/world";
import Body from "./Body";
import {Vec2} from "../utils/math";

export default class PhysicsWorld {

    private static readonly BLOCKER_TILE = 1;

    private static readonly BOUND_TOP = TILE_SIZE + BODY_HEIGHT / 2;
    private static readonly BOUND_RIGHT = WORLD_WIDTH - TILE_SIZE - BODY_WIDTH / 2;
    private static readonly BOUND_BOTTOM = WORLD_HEIGHT - TILE_SIZE - BODY_HEIGHT / 2;
    private static readonly BOUND_LEFT = TILE_SIZE + BODY_WIDTH / 2;

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

    constructor(private readonly map: number[]) {
    }

    public move(body: Body, vec2: Vec2, result?: Body): Body {
        if (!result) {
            result = {x: body.x, y: body.y};
        }

        for(let i = 0; i < PhysicsWorld.MOVE_STEPS; i++) {
            result.x += vec2.x / PhysicsWorld.MOVE_STEPS;
            result.y += vec2.y / PhysicsWorld.MOVE_STEPS;

            this.update(result);
        }

        return result;
    }

    public update(body: Body) {
        this.bound(body);
        this.collideAndRespond(body);
    }

    private bound(body: Body) {
        if (body.y < PhysicsWorld.BOUND_TOP) body.y = PhysicsWorld.BOUND_TOP;
        if (body.x > PhysicsWorld.BOUND_RIGHT) body.x = PhysicsWorld.BOUND_RIGHT;
        if (body.y > PhysicsWorld.BOUND_BOTTOM) body.y = PhysicsWorld.BOUND_BOTTOM;
        if (body.x < PhysicsWorld.BOUND_LEFT) body.x = PhysicsWorld.BOUND_LEFT;
    }

    private collideAndRespond(body: Body) {
        const bodyTileX = Math.floor(body.x / TILE_SIZE);
        const bodyTileY = Math.floor(body.y / TILE_SIZE);

        const passOrder = PhysicsWorld.COLLISION_AREA_PASS_ORDER;
        for(let i = 0; i < passOrder.length; i++) {
            const locator = passOrder[i];

            const tx = bodyTileX + locator.dx;
            const ty = bodyTileY + locator.dy;

            const tile = this.getTile(tx, ty);

            if (tile == PhysicsWorld.BLOCKER_TILE && this.collides(body, tx, ty)) {
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
                body.x = tilePosX + TILE_SIZE / 2 + BODY_WIDTH / 2;
            } else {
                body.x = tilePosX - TILE_SIZE / 2 - BODY_WIDTH / 2;
            }
        } else {
            if (dy > 0) {
                body.y = tilePosY + TILE_SIZE / 2 + BODY_HEIGHT / 2;
            } else {
                body.y = tilePosY - TILE_SIZE / 2 - BODY_HEIGHT / 2;
            }
        }
    }

    private collides(body: Body, tx: number, ty: number) {
        const xAxis = (tx * TILE_SIZE < body.x + BODY_WIDTH / 2) && (tx * TILE_SIZE + TILE_SIZE > body.x - BODY_WIDTH / 2);
        const yAxis = (ty * TILE_SIZE < body.y + BODY_HEIGHT / 2) && (ty * TILE_SIZE + TILE_SIZE > body.y - BODY_HEIGHT / 2);

        return xAxis && yAxis;
    }

    public getTile(tx: number, ty: number) {
        return this.map[ty * TILES_WIDTH + tx];
    }
}
