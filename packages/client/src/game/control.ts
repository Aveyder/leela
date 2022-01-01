import {Keys} from "./types";
import {Vec2} from "@leela/common";

function toVec2(keys: Keys, vec2?: Vec2): Vec2 {
    if (!vec2) {
        vec2 = {x: 0, y: 0};
    }

    vec2.x = 0;
    vec2.y = 0;

    if (keys.A.isDown || keys.left.isDown) {
        vec2.x -= 1;
    }
    if (keys.D.isDown || keys.right.isDown) {
        vec2.x += 1;
    }
    if (keys.W.isDown || keys.up.isDown) {
        vec2.y -= 1;
    }
    if (keys.S.isDown || keys.down.isDown) {
        vec2.y += 1;
    }

    return vec2;
}

export {
    toVec2
};
