import {Vec2} from "../utils/math";

const posInterpolator = (pos1: Vec2, pos2: Vec2, progress: number, result?: Vec2) => {
    if (!result) {
        result = {x: 0, y: 0};
    }
    result.x = pos1.x + (pos2.x - pos1.x) * progress;
    result.y = pos1.y + (pos2.y - pos1.y) * progress;

    return result;
};

export {
    posInterpolator
}
