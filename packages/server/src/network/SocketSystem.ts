import {Socket} from "socket.io";
import {ClientId} from "@leela/common";

export default class SocketSystem {

    private readonly sockets: Record<ClientId, Socket>;

    constructor() {
        this.sockets = {};
    }

    public put(id: ClientId, socket: Socket): void {
        this.sockets[id] = socket;
    }

    public get(id: ClientId): Socket {
        return this.sockets[id];
    }

    public remove(id: ClientId): void {
        delete this.sockets[id];
    }

    public getClientIds(): ClientId[] {
        return Object.keys(this.sockets);
    }
}
