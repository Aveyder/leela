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

type SkinId = number;

interface Char extends Entity, Positioned {
    skin: SkinId
}

type Snapshot = Entity[];

export {
    EntityType,
    EntityId,
    Entity,
    Positioned,
    SkinId,
    Char,
    Snapshot
};