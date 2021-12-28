import {AckTick, Stamp, Tick} from "@leela/common";

export default class Ticks {

    server: Stamp;
    client: Tick;

    constructor() {
        this.server = {tick: -1, ack: -1, time: -1} as Stamp;
        this.client = -1;
    }
}
