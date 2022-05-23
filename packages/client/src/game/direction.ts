import {Vec2} from "@leela/common";

enum Direction {
    LEFT = "left",
    RIGHT = "right",
    DOWN = "down",
    UP = "up"
}

function getDirection(dirVec: Vec2): Direction {
    let dir;

    if (Math.abs(dirVec.y)/Math.abs(dirVec.x) >= 0.9) {
        if (dirVec.y > 0) {
            dir = Direction.DOWN;
        }
        if (dirVec.y < 0) {
            dir = Direction.UP;
        }
    } else {
        if (dirVec.x > 0) {
            dir = Direction.RIGHT;
        }
        if (dirVec.x < 0) {
            dir = Direction.LEFT;
        }
    }

    return dir;
}

export {
    Direction,
    getDirection
};
