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

export {
    clamp,
    toFixed,
    Vec2,
    scaleVec2
}
