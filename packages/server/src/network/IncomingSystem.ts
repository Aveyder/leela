import Ticks from "./Ticks";
import {AddressedPacket} from "./types";
import {AckTick, ClientId, Message, MessageSystem, Packet, Stamp, Tick, Timestamp} from "@leela/common";

export default class IncomingSystem {

    constructor(
        private readonly ticks: Ticks,
        private readonly packetsIncoming: AddressedPacket[],
        private readonly messages: MessageSystem
    ) {
    }

    public receivePackets(): void {
        this.packetsIncoming.forEach(addressed => {
            const [id, clientPacket] = addressed;

            this.receivePacket(id, clientPacket);
        });

        this.packetsIncoming.length = 0;
    }

    private receivePacket(id: ClientId, clientPacket: Packet) {
        const time = clientPacket.shift() as Timestamp;
        const tick = clientPacket.shift() as Tick;
        const ack = clientPacket.shift() as AckTick;

        const stamp = this.ticks.clients[id] as Stamp;

        const outdated = stamp && (stamp.time > time || stamp.tick > tick);

        if (!outdated) {
            this.ticks.clients[id] = {tick, ack, time};

            this.messages.receiveMessages(clientPacket as Message[], id);
        }
    }
}
