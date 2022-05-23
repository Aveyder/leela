import Controller from "./Controller";
import {ClientId, Data, EntityId, MessageSystem, Opcode} from "@leela/common";
import World from "../world/World";
import Ticks from "../../network/Ticks";

export default class MovementSystem {

    private readonly players: Record<ClientId, EntityId>;

    private readonly world: World;

    private readonly messages: MessageSystem;
    private readonly ticks: Ticks;

    constructor(private readonly controller: Controller) {
        this.players = this.controller.players;

        this.world = this.controller.world;

        this.messages = this.controller.network.messages;
        this.ticks = this.controller.network.ticks;

        this.init();
    }

    private init() {
        this.messages.on(Opcode.Move, this.onMove, this);
    }

    private onMove(data: Data, id: ClientId) {
        const playerId = this.players[id];

        if (playerId != undefined) {
            const vx = data[0] as number;
            const vy = data[1] as number;

            this.world.moveChar(playerId, vx, vy, this.ticks.delta);
        }
    }
}
