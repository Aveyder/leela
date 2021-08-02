import Ticks from "./Ticks";
import {AddressedPacket} from "./types";
import {ClientId, ClientPacket, Message, MessageSystem, Stamp, Tick, Timestamp} from "@leela/common";

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

            this.receivePacketIncoming(id, clientPacket);
        });

        this.packetsIncoming.length = 0;
    }

    private receivePacketIncoming(id: ClientId, clientPacket: ClientPacket) {
        const timestamp = clientPacket.shift() as Timestamp;
        const tick = clientPacket.shift() as Tick;

        const stamp = this.ticks.clients[id] as Stamp;

        const outdated = stamp && (stamp.timestamp > timestamp || stamp.tick > tick);

        if (!outdated) {
            this.messages.receiveMessages(clientPacket as Message[], id);

            this.ticks.clients[id] = {timestamp, tick};
        }
    }
}