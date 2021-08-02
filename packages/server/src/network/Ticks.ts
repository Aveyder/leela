import {ClientId, Stamp, Tick} from "@leela/common";

export default class Ticks {

    public server: Tick;
    public readonly clients: Record<ClientId, Stamp>;

    constructor() {
        this.clients = {};
        this.server = -1;
    }
}
