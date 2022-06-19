enum EntityType {
    CHAR
}

type EntityId = number;

interface Entity {
    id: EntityId;
    type: EntityType
}

interface Positioned {
    x: number;
    y: number;
}

interface Moving {
    vx: number;
    vy: number;
}

type SkinId = number;

interface Char extends Entity, Positioned, Moving {
    skin: SkinId
}

type Snapshot = Entity[];

export {
    EntityType,
    EntityId,
    Entity,
    Positioned,
    Moving,
    SkinId,
    Char,
    Snapshot
};