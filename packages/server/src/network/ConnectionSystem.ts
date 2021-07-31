import {Server} from "socket.io";
import PacketSystem from "./PacketSystem";
import SocketSystem from "./SocketSystem";

export default class ConnectionSystem {
    constructor(
        private readonly io: Server,
        private readonly sockets: SocketSystem,
        private readonly packets: PacketSystem
    ) {}

    public init(): void {
        this.io.on("connection", socket => {
            console.log("a user connected");

            this.sockets.put(socket.id, socket);

            socket.on("message", (input: string) => {
                this.packets.accept(socket.id, input);
            });

            socket.on("disconnect", () => {
                console.log("user disconnected");

                this.sockets.remove(socket.id);
            });
        });
    }
}
