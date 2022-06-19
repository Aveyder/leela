function clamp(number: number, min: number, max: number): number {
    return Math.max(min, Math.min(number, max));
}

function toFixed(value: number, fractionDigits: number): number {
    return Number(value.toFixed(fractionDigits));
}

type Vec2 = {x: number, y: number};

function scaleVec2(vec2: Vec2, scale: number): Vec2 {
    vec2.x *= scale;
    vec2.y *= scale;

    return vec2;
}

function cloneVec2(vec2: Vec2, result?: Vec2): Vec2 {
    if (!result) {
        result = {x: 0, y: 0};
    }

    result.x = vec2.x;
    result.y = vec2.y;

    return result;
}

function normalize(vec2: Vec2, result?: Vec2): Vec2 {
    if (!result) {
        result = {x: 0, y: 0};
    }

    result.x = Math.sign(vec2.x);
    result.y = Math.sign(vec2.y);

    return result;
}

export {
    clamp,
    toFixed,
    Vec2,
    scaleVec2,
    cloneVec2,
    normalize
}
