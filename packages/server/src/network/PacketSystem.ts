import {ClientId, Data, Message, Opcode, Packet} from "@leela/common";

export default class PacketSystem {

    public readonly incoming: Packet;
    public readonly outgoing: Record<ClientId, Packet>;

    constructor() {
        this.incoming = [];
        this.outgoing = {};
    }

    public pushBroadcast(opcode: Opcode, data?: Data, ignoring?: ClientId[]): void {
        Object.keys(this.outgoing).filter(
            id => !ignoring || (ignoring.indexOf(id) < 0)
        ).forEach(id => {
            this.push(id, opcode, data);
        });
    }

    public push(id: ClientId, opcode: Opcode, data?: Data): void {
        const packet = this.outgoing[id] || [] as Packet;

        const message = (data ? [opcode, ...data] : [opcode]) as Message;

        packet.push(message);

        this.outgoing[id] = packet;
    }

    public accept(id: ClientId, input: string): void {
        const message = JSON.parse(input) as Message;

        message.splice(1, 0, id);

        this.incoming.push(message);
    }
}
