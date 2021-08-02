import SocketSystem from "./SocketSystem";
import {ClientId, Message, ServerPacket} from "@leela/common";
import Ticks from "./Ticks";

export default class OutgoingSystem {

    constructor(
        private readonly ticks: Ticks,
        private readonly sockets: SocketSystem,
        private readonly outgoing: Record<ClientId, Message[]>
    ) {}

    public send(): void {
        Object.keys(this.outgoing).forEach(id => {
            const socket = this.sockets.get(id);

            if (socket) {
                const messages = this.outgoing[id];

                if (messages.length > 0) {
                    const packet = this.createServerPacket(id, messages);

                    const json = JSON.stringify(packet);

                    socket.send(json);

                    this.outgoing[id].length = 0;
                }
            }
        });
    }

    private createServerPacket(id: ClientId, messages: Message[]) {
        const ticks = this.ticks;

        return [
            Date.now(),
            ticks.server,
            ticks.clients[id]?.tick || -1,
            ...messages
        ] as ServerPacket;
    }
}
