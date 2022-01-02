import World from "./World";
import NetworkSystem from "../network/NetworkSystem";
import {Char, ClientId, EntityId, Opcode, TICK} from "@leela/common";

export default class Controller {

    private readonly players: Record<ClientId, EntityId>;

    constructor(
        private readonly network: NetworkSystem,
        private readonly world: World
    ) {
        this.players = {};

        this.init();
    }

    private init() {
        this.network.connections.events.on("disconnect", id => {
            const entityId = this.players[id];

            this.world.deleteChar(entityId);

            delete this.players[id];

            this.network.packets.pushBroadcast(Opcode.Disappear, [entityId]);
        });

        this.network.messages.on(Opcode.JoinRequest, (data, id) => {
            const char = this.world.spawnChar();

            this.players[id] = char.id;

            this.network.packets.push(id, Opcode.JoinResponse, [char.id, char.x, char.y, char.skin]);
        });

        this.network.messages.on(Opcode.Move, (data, id) => {
            const playerId = this.players[id];
            if (playerId != undefined) {
                const vx = data[0] as number;
                const vy = data[1] as number;

                this.world.moveChar(playerId, vx, vy, this.network.ticks.delta);
            }
        });

        this.network.snapshots.events.on(TICK, (id) => {
             const chars = this.world.chars;

             const data = [];

             Object.keys(chars).forEach(entityId => {
                 const char = chars[entityId] as Char;

                 data.push(char.id, char.x, char.y, char.skin);
             });

             this.network.packets.push(id, Opcode.Snapshot, data);
        });
    }
}
