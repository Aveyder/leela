import {ClientId, Stamp, Tick} from "@leela/common";

export default class Ticks {

    public server: Tick;
    public delta: number;
    public readonly clients: Record<ClientId, Stamp>;

    constructor() {
        this.clients = {};
        this.server = -1;
    }
}
