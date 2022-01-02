import {Char} from "./types";
import {
    CHAR_SKINS,
    EntityId,
    FRACTION_DIGITS,
    move,
    Vec2,
    WORLD_HEIGHT,
    WORLD_WIDTH,
    bound,
    toFixed
} from "@leela/common";

export default class World {

    public entityId;

    public readonly chars: Record<EntityId, Char>;

    private readonly tmpVec2: Vec2;

    constructor() {
        this.entityId = 0;

        this.chars = {};

        this.tmpVec2 = {x: 0, y: 0};
    }

    public spawnChar(x?: number, y?: number): Char {
        const id = this.entityId++ as EntityId;

        const char: Char = {
            id,
            skin: Math.floor(Math.random() * CHAR_SKINS),
            x: toFixed(x != undefined ? x : Math.random() * WORLD_WIDTH, FRACTION_DIGITS),
            y: toFixed(y != undefined ? y : Math.random() * WORLD_HEIGHT, FRACTION_DIGITS)
        }

        bound(char);

        this.chars[id] = char;

        return char;
    }

    public deleteChar(id: EntityId): void {
        delete this.chars[id];
    }

    public moveChar(id: EntityId, vx: number, vy: number, delta?: number): void {
        const char = this.chars[id];

        this.tmpVec2.x = vx;
        this.tmpVec2.y = vy;

        move(char, this.tmpVec2, delta, char);
    }
}
