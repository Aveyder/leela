import {ClientId, ClientPacket, createMessage, Data, Message, Opcode} from "@leela/common";
import {AddressedPacket} from "./types";

export default class PacketSystem {

    public readonly incoming: AddressedPacket[];
    public readonly outgoing: Record<ClientId, Message[]>;

    constructor() {
        this.incoming = [];
        this.outgoing = {};
    }

    public accept(id: ClientId, input: string): void {
        const clientPacket = JSON.parse(input) as ClientPacket;

        this.incoming.push([id, clientPacket]);
    }

    public pushBroadcast(opcode: Opcode, data?: Data, ignoring?: ClientId[]): void {
        Object.keys(this.outgoing).filter(
            id => !ignoring || (ignoring.indexOf(id) < 0)
        ).forEach(id => {
            this.push(id, opcode, data);
        });
    }

    public push(id: ClientId, opcode: Opcode, data?: Data): void {
        const messages = this.outgoing[id] || [] as Message[];

        const message = createMessage(opcode, data);

        messages.push(message);

        this.outgoing[id] = messages;
    }
}
