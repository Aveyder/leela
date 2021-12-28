import {AckTick, Tick, Timestamp} from "./types";

export default interface Stamp {
    tick: Tick;
    ack: AckTick;
    time: Timestamp;
}
