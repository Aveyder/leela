import Controller from "./Controller";
import {Char, ClientId, MessageSystem, Opcode, scaleVec2, Vec2} from "@leela/common";
import World from "../world/World";
import Ticks from "../../network/Ticks";

export default class MovementSystem {

    private readonly playerChars: Record<ClientId, Char>;

    private readonly world: World;

    private readonly messages: MessageSystem;
    private readonly ticks: Ticks;

    private readonly tmpVec2: Vec2;

    constructor(private readonly controller: Controller) {
        this.playerChars = this.controller.playerChars;

        this.world = this.controller.world;

        this.messages = this.controller.network.messages;
        this.ticks = this.controller.network.ticks;

        this.tmpVec2 = {x: 0, y: 0};

        this.init();
    }

    private init() {
        this.messages.on(Opcode.Move, this.onMove, this);
    }

    private onMove(dir: Vec2, id: ClientId) {
        const char = this.playerChars[id];

        if (char) {
            const r = Math.random() > 0.02 ? 1 : 2;

            this.world.moveChar(char, scaleVec2(dir, this.ticks.delta * r));
        }
    }
}
