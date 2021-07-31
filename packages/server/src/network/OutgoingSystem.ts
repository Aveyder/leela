import SocketSystem from "./SocketSystem";
import {ClientId, Packet} from "@leela/common";

export default class OutgoingSystem {

    constructor(
        private readonly sockets: SocketSystem,
        private readonly outgoing: Record<ClientId, Packet>
    ) {}

    public send(): void {
        Object.keys(this.outgoing).forEach(id => {
            const socket = this.sockets.get(id);

            if (socket) {
                const packet = this.outgoing[id];

                if (packet.length > 0) {
                    const json = JSON.stringify(packet);

                    socket.send(json);

                    delete this.outgoing[id];
                }
            }
        });
    }
}
