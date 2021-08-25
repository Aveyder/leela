import {CHAR_HEIGHT, CHAR_WIDTH, WORLD_HEIGHT, WORLD_WIDTH} from "../constants/world";

function clampBoundaries(point: {x: number, y: number}) {
    if (point.x >= WORLD_WIDTH - CHAR_WIDTH / 2) {
        point.x = WORLD_WIDTH - CHAR_WIDTH / 2;
    }

    if (point.x <= CHAR_WIDTH / 2) {
        point.x = CHAR_WIDTH / 2;
    }

    if (point.y >= WORLD_HEIGHT - CHAR_HEIGHT / 2) {
        point.y = WORLD_HEIGHT - CHAR_HEIGHT / 2;
    }

    if (point.y <= CHAR_HEIGHT / 2) {
        point.y = CHAR_HEIGHT / 2;
    }
}

export {
    clampBoundaries
}
