import PacketSystem from "./PacketSystem";
import {RoomId} from "./types";
import {ClientId, Data, Opcode} from "@leela/common";

export default class RoomSystem {

    private readonly rooms: Record<RoomId, ClientId[]>;

    constructor(
        private readonly packets: PacketSystem
    ) {
        this.rooms = {};
    }

    public add(room: RoomId, id: ClientId): void {
        const clients = this.rooms[room] || [];

        if (clients.indexOf(id) == -1) {
            clients.push(id);
        }

        this.rooms[room] = clients;
    }

    public remove(room: RoomId, id?: ClientId): void {
        if (id) {
            const clients = this.rooms[room];

            if (clients) {
                const i = clients.indexOf(id);

                if (i != -1) clients.splice(i, 1);
            }
        } else {
            delete this.rooms[room];
        }
    }

    public push(room: RoomId, opcode: Opcode, data?: Data): void {
        const clients = this.rooms[room];

        if (clients?.length > 0) {
            clients.forEach(id => {
                this.packets.push(id, opcode, data);
            });
        }
    }
}
