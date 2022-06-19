import {
    Char,
    CHAR_SKINS,
    EntityId,
    EntityType,
    map,
    applySpeed,
    PhysicsWorld,
    SkinId,
    Vec2,
    WORLD_HEIGHT,
    WORLD_WIDTH, normalize
} from "@leela/common";

export default class World {

    private entityId;

    public readonly chars: Record<EntityId, Char>;

    private readonly physics: PhysicsWorld;

    constructor() {
        this.entityId = 0;

        this.chars = {};

        this.physics = new PhysicsWorld(map);
    }

    public spawnChar(skin?: SkinId, x?: number, y?: number): Char {
        const id = this.entityId++ as EntityId;

        const char: Char = {
            id,
            type: EntityType.CHAR,
            skin: skin != undefined ? skin : Math.floor(Math.random() * CHAR_SKINS),
            x: 0,
            y: 0,
            vx: 0,
            vy: 0
        }

        this.positionChar(char,
            x != undefined ? x : Math.random() * WORLD_WIDTH,
            y != undefined ? y: Math.random() * WORLD_HEIGHT
        );

        this.chars[id] = char;

        return char;
    }

    public deleteChar(char: Char): void {
        delete this.chars[char.id];
    }

    public moveChar(char: Char, vec2: Vec2): void {
        applySpeed(vec2, vec2);
        this.physics.move(char, vec2, char);

        char.vx = vec2.x;
        char.vy = vec2.y;
    }

    public positionChar(char: Char, x: number, y: number) {
        char.x = x;
        char.y = y;

        this.physics.update(char);
    }
}
