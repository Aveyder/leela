const SERVER_HOST = "http://localhost:3000";

const INTERPOLATE = true;
const INTERPOLATE_BUFFER_MS = 1000;
const INTERPOLATE_DEDUPLICATE = true;
const INTERPOLATE_DEDUPLICATE_MAX = 3;

const ENTITY_EXTRAPOLATE = true;
const ENTITY_EXTRAPOLATE_MAX_MS = 250;
const ENTITY_EXTRAPOLATE_PAST = true;

const CLIENT_PREDICT = true;
const CLIENT_SMOOTH = true;
const CLIENT_SMOOTH_POSITION_PRECISION = 0.1;
const CLIENT_SMOOTH_POSITION_THRESHOLD = 30;
const CLIENT_SMOOTH_POSITION_MAX_MS = 30000;

const SHOW_ERROR = true;

const CLIENT_CMD_LOOP = false;
const CLIENT_CMD_RATE = -1;

const CLIENT_UPDATE_RATE = -1;

const PING_DELAY_MS = 2000;
const RANDOMIZE_PING_DELAY = 0.5;

const TIMESYNC_INTERVAL_MS=30000;

export {
    SERVER_HOST,
    INTERPOLATE,
    INTERPOLATE_BUFFER_MS,
    INTERPOLATE_DEDUPLICATE,
    INTERPOLATE_DEDUPLICATE_MAX,
    ENTITY_EXTRAPOLATE,
    ENTITY_EXTRAPOLATE_MAX_MS,
    ENTITY_EXTRAPOLATE_PAST,
    CLIENT_PREDICT,
    CLIENT_SMOOTH_POSITION_PRECISION,
    CLIENT_SMOOTH_POSITION_THRESHOLD,
    CLIENT_SMOOTH,
    CLIENT_SMOOTH_POSITION_MAX_MS,
    SHOW_ERROR,
    CLIENT_CMD_LOOP,
    CLIENT_CMD_RATE,
    CLIENT_UPDATE_RATE,
    PING_DELAY_MS,
    RANDOMIZE_PING_DELAY,
    TIMESYNC_INTERVAL_MS
};
