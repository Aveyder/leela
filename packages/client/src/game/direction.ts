import {Vec2} from "@leela/common";

enum Direction {
    LEFT = "left",
    RIGHT = "right",
    DOWN = "down",
    UP = "up"
}

function getDirection(dirVec: Vec2): Direction {
    let dir;

    if (dirVec.x === -1) {
        dir = Direction.LEFT;
    }

    if (dirVec.x === 1) {
        dir = Direction.RIGHT;
    }

    if (dirVec.y === 1) {
        dir = Direction.DOWN;
    }

    if (dirVec.y === -1) {
        dir = Direction.UP;
    }

    return dir;
}

export {
    Direction,
    getDirection
};
