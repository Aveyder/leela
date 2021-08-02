import {AckTick, Stamp, Tick} from "@leela/common";

export default class Ticks {

    server: Stamp;
    clientAck: AckTick;
    client: Tick;

    constructor() {
        this.server = {timestamp: -1, tick: -1};
        this.clientAck = -1;
        this.client = -1;
    }
}
