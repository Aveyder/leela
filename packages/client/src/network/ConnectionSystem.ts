import {Socket} from "socket.io-client";
import IncomingSystem from "./IncomingSystem";
import {PING} from "@leela/common";
import {PING_DELAY_MS, RANDOMIZE_PING_DELAY} from "../constants/config";

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

        this.ping();
    }

    public ping(): void {
        this.socket.emit(PING, Date.now());

        const delay = PING_DELAY_MS * (RANDOMIZE_PING_DELAY * (2 * Math.random() - 1) + 1);

        setTimeout(() => this.ping(), delay);
    }
}
