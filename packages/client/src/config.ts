import {TILE_SIZE} from "@leela/common";

const GAME_WIDTH = 640;
const GAME_HEIGHT = 640;

const SERVER_PROTO = "http"
const SERVER_HOST = "localhost:3000";
const SERVER_URL = `${SERVER_PROTO}://${SERVER_HOST}`

const INTERPOLATE = true;
const INTERPOLATE_BUFFER_MS = 1000;
const INTERPOLATE_DROP_DUPLICATES = 3;

const ENTITY_EXTRAPOLATE = true;
const ENTITY_EXTRAPOLATE_MAX_MS = 250;

const CLIENT_PREDICT = true;
const CLIENT_SMOOTH = true;
const CLIENT_SMOOTH_POS_ERROR_PRECISION = 0.1;
const CLIENT_SMOOTH_POS_ERROR_THRESHOLD = TILE_SIZE;
const CLIENT_SMOOTH_POS_MS = 100;

const CLIENT_CMD_LOOP = false;
const CLIENT_CMD_RATE = -1;

const CLIENT_UPDATE_RATE = -1;

const PING_INTERVAL_MS = 1000;

const TIMESYNC_INTERVAL_MS = 30000;

const DEBUG_MODE = true;

const TICK_CAP = 100;

export {
    GAME_WIDTH,
    GAME_HEIGHT,
    SERVER_HOST,
    SERVER_URL,
    INTERPOLATE,
    INTERPOLATE_BUFFER_MS,
    INTERPOLATE_DROP_DUPLICATES,
    ENTITY_EXTRAPOLATE,
    ENTITY_EXTRAPOLATE_MAX_MS,
    CLIENT_PREDICT,
    CLIENT_SMOOTH_POS_ERROR_PRECISION,
    CLIENT_SMOOTH_POS_ERROR_THRESHOLD,
    CLIENT_SMOOTH,
    CLIENT_SMOOTH_POS_MS,
    CLIENT_CMD_LOOP,
    CLIENT_CMD_RATE,
    CLIENT_UPDATE_RATE,
    PING_INTERVAL_MS,
    TIMESYNC_INTERVAL_MS,
    DEBUG_MODE,
    TICK_CAP
};
