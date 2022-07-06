import {Vec2} from "@leela/common";

const equals = (vecA: Vec2, vecB: Vec2) => {
    return vecA.x == vecB.x && vecA.y == vecB.y;
}

const diff = (vecA: Vec2, vecB: Vec2, result?: Vec2) => {
    if (!result) {
        result = {x: 0, y: 0};
    }
    result.x = vecB.x - vecA.x;
    result.y = vecB.y - vecA.y;

    return result;
}

const interpolate = (vecA: Vec2, vecB: Vec2, progress: number, result?: Vec2) => {
    if (!result) {
        result = {x: 0, y: 0};
    }
    result.x = vecA.x + (vecB.x - vecA.x) * progress;
    result.y = vecA.y + (vecB.y - vecA.y) * progress;

    return result;
};

export {
    equals,
    diff,
    interpolate
};
