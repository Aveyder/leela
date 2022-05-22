import {Server} from "socket.io";
import PacketSystem from "./PacketSystem";
import SocketSystem from "./SocketSystem";
import SnapshotSystem from "./SnapshotSystem";
import EventEmitter from "eventemitter3";
import {PING} from "@leela/common";

export default class ConnectionSystem {

    public readonly events: EventEmitter;

    constructor(
        private readonly io: Server,
        private readonly sockets: SocketSystem,
        private readonly packets: PacketSystem,
        private readonly snapshots: SnapshotSystem
    ) {
        this.events = new EventEmitter();
    }

    public init(): void {
        this.io.on("connection", socket => {
            console.log(`user connected: ${socket.id}`);

            this.sockets.put(socket.id, socket);
            this.snapshots.set(socket.id, -1); // now?

            socket.on(PING, callback => callback());

            socket.on("message", (input: string) => {
                this.packets.accept(socket.id, input);
            });

            socket.on("disconnect", () => {
                console.log(`user disconnected: ${socket.id}`);

                this.events.emit("disconnect", socket.id);

                this.sockets.remove(socket.id);
                this.snapshots.remove(socket.id);
            });
        });
    }
}
