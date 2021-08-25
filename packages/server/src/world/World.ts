import NetworkSystem from "../network/NetworkSystem";
import {
    Char,
    CHAR_HEIGHT,
    CHAR_MAX_ID, CHAR_SPEED,
    CHAR_WIDTH,
    ClientId, Data,
    Opcode,
    PlayerId, serializeSnapshot,
    TICK,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "@leela/common";
import {clampBoundaries} from "@leela/common";
import * as math from "../utils/math";

export default class World {

    private id: number;

    private readonly players: Record<ClientId, PlayerId>;
    private readonly chars: Record<PlayerId, Char>;
    private readonly movements: Record<PlayerId, { vx: number, vy: number }>;

    constructor(
        private readonly network: NetworkSystem
    ) {
        this.id = 0;

        this.players = {};
        this.chars = {};
        this.movements = {};
    }

    public init() {
        this.network.connections.events.on("disconnect", (id: string) => {
            const playerId = this.players[id];

            delete this.chars[playerId];
            delete this.movements[playerId];
            delete this.players[id];
        });

        this.network.messages.on(Opcode.JoinRequest, (data, id) => {
            const playerId = this.id++;

            const char = {
                morph: Math.round(Math.random() * CHAR_MAX_ID),
                x: Math.random() * WORLD_WIDTH,
                y: Math.random() * WORLD_HEIGHT,
            } as Char;

            clampBoundaries(char);

            char.x = math.toFixed(char.x, 2);
            char.y = math.toFixed(char.y, 2);

            this.chars[playerId] = char;
            this.movements[playerId] = {vx: 0, vy: 0};
            this.players[id] = playerId;

            this.network.packets.push(id, Opcode.JoinResponse, [playerId]);
        });

        this.network.messages.on(Opcode.Move, (data: number[], id: string) => {
            const playerId = this.players[id];

            if (Number.isInteger(playerId)) {
                const movement = this.movements[playerId];

                movement.vx += data.shift();
                movement.vy += data.shift();
            }
        });

        this.network.simulations.events.on(TICK, (delta: number) => {
            Object.keys(this.chars).forEach(playerId => {
                const char = this.chars[playerId] as Char;
                const movement = this.movements[playerId];

                if (movement.vx || movement.vy) {
                    char.x += movement.vx * CHAR_SPEED * delta;
                    char.y += movement.vy * CHAR_SPEED * delta;

                    clampBoundaries(char);

                    char.x = math.toFixed(char.x, 2);
                    char.y = math.toFixed(char.y, 2);

                    movement.vx = 0;
                    movement.vy = 0;
                }
            });
        });

        this.network.snapshots.events.on(TICK, (id: string) => {
            if (Number.isInteger(this.players[id])) {
                this.network.packets.push(id, Opcode.Snapshot, serializeSnapshot(this.chars));
            }
        });
    }
}
