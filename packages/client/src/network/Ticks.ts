import {AckTick, Stamp, Tick} from "@leela/common";

export default class Ticks {

    server: Stamp;
    clientAck: AckTick;
    client: Tick;

    constructor() {
        this.server = {time: -1, tick: -1} as Stamp;
        this.clientAck = -1;
        this.client = -1;
    }
}
