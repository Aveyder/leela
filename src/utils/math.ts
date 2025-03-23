export function toFixed(value: number, fractionDigits: number): number {
    return Number(value.toFixed(fractionDigits));
}

export type Vec2 = {x: number, y: number};

export const TMP_VEC2: Vec2 = {x: 0, y: 0};

export const interpolate = (vecA: Vec2, vecB: Vec2, progress: number, result?: Vec2) => {
    if (!result) {
        result = {x: 0, y: 0};
    }
    result.x = vecA.x + (vecB.x - vecA.x) * progress;
    result.y = vecA.y + (vecB.y - vecA.y) * progress;

    return result;
};

export const deltaVec2 = (vecA: Vec2, vecB: Vec2, result?: Vec2) => {
    if (!result) {
        result = {x: 0, y: 0};
    }
    result.x = vecB.x - vecA.x;
    result.y = vecB.y - vecA.y;

    return result;
}
