import {
    Char,
    Data,
    deserializer,
    Entity,
    EntityType,
    Opcode,
    SerdeSystem,
    serializer,
    SkinId,
    Snapshot,
    Vec2
} from "@leela/common";

function init(serde: SerdeSystem) {
    serde.registerDeserializer(Opcode.Snapshot, deserializer(snapshot));
    serde.registerDeserializer(Opcode.JoinResponse, deserializer(entity));
    serde.registerSerializer(Opcode.Move, serializer(move));
}

function snapshot(input: unknown[]): Snapshot {
    const snapshot = [];

    for (let i = 0; i < input.length; i += 2) {
        const entity = deserializeEntity(i, input);

        snapshot.push(entity);

        if (entity.type == EntityType.CHAR) {
            i += 3;
        }
    }

    return snapshot;
}

function entity(input: unknown[]): Entity {
    return deserializeEntity(0, input);
}

function deserializeEntity(index: number, serialized: unknown[]) {
    const entity = {
        id: serialized[index] as number,
        type: serialized[index + 1] as EntityType
    } as Entity;

    if (entity.type == EntityType.CHAR) {
        const char = entity as Char;
        char.x = serialized[index + 2] as number;
        char.y = serialized[index + 3] as number;
        char.skin = serialized[index + 4] as SkinId;
    }

    return entity;
}

function move(dir: Vec2): Data {
    return (1 + dir.x) * 3 + (1 + dir.y);
}

export {
    init
}
