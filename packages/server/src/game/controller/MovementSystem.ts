import Controller from "./Controller";
import {ClientId, EntityId, MessageSystem, Opcode, Vec2} from "@leela/common";
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

    private onMove(dir: Vec2, id: ClientId) {
        const playerId = this.players[id];

        if (playerId != undefined) {
            this.world.moveChar(playerId, dir.x, dir.y, this.ticks.delta);
        }
    }
}
