import {
    Char,
    Data,
    deserializer,
    Entity,
    EntityType,
    FRACTION_DIGITS,
    Opcode,
    SerdeSystem,
    serializer,
    Snapshot,
    toFixed,
    Vec2
} from "@leela/common";

function init(serde: SerdeSystem) {
    serde.registerSerializer(Opcode.Snapshot, serializer(snapshot));
    serde.registerSerializer(Opcode.JoinResponse, serializer(entity));
    serde.registerDeserializer(Opcode.Move, deserializer(move));
}

function snapshot(snapshot: Snapshot): Data {
    const serialized = [];
    for(let i = 0; i < snapshot.length; i++) {
        const entity = snapshot[i];

        serializeEntity(entity, serialized);
    }
    return serialized;
}

function entity(entity: Entity): Data {
    return serializeEntity(entity);
}

function serializeEntity(entity: Entity, serialized?: unknown[]) {
    if (!serialized) {
        serialized = [];
    }

    serialized.push(
        entity.id,
        entity.type
    );

    if (entity.type == EntityType.CHAR) {
        const char = entity as Char;

        serialized.push(
            toFixed(char.x, FRACTION_DIGITS),
            toFixed(char.y, FRACTION_DIGITS),
            char.skin,
            toFixed(char.vx, FRACTION_DIGITS),
            toFixed(char.vy, FRACTION_DIGITS)
        );
    }

    return serialized;
}

function move(input: number, result?: Vec2): Vec2 {
    if (!result) {
        result = {x: 0, y: 0};
    }

    result.x = -1;
    if (input > 2) {
        result.x = 0;
    }
    if (input > 5) {
        result.x = 1;
    }
    result.y = input - 4 - 3 * result.x;

    return result;
}

export {
    init
}
