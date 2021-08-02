import {Socket} from "socket.io-client";
import IncomingSystem from "./IncomingSystem";

export default class ConnectionSystem {

    constructor(
        private readonly socket: Socket,
        private readonly incoming: IncomingSystem
    ) {
    }

    public init(): void {
        this.socket.on("message", (input: string) => {
            this.incoming.receive(input);
        });
    }
}
