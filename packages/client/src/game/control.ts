import {Keys} from "./types";
import {Vec2} from "@leela/common";

function toVec2(keys: Keys, result?: Vec2): Vec2 {
    if (!result) {
        result = {x: 0, y: 0};
    }

    result.x = 0;
    result.y = 0;

    if (keys.A.isDown || keys.left.isDown) {
        result.x -= 1;
    }
    if (keys.D.isDown || keys.right.isDown) {
        result.x += 1;
    }
    if (keys.W.isDown || keys.up.isDown) {
        result.y -= 1;
    }
    if (keys.S.isDown || keys.down.isDown) {
        result.y += 1;
    }

    return result;
}

export {
    toVec2
};
