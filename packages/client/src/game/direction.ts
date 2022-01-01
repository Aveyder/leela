import {Vec2} from "@leela/common";

function getDirection(dirVec: Vec2): string {
    let dir;

    if (dirVec.x === -1) {
        dir = "left";
    }

    if (dirVec.x === 1) {
        dir = "right";
    }

    if (dirVec.y === 1) {
        dir = "down";
    }

    if (dirVec.y === -1) {
        dir = "up";
    }

    return dir;
}

export {
    getDirection
};
