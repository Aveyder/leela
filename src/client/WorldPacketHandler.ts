import WorldSession from "./WorldSession";
import WorldPacket from "../protocol/WorldPacket";
import Codec from "../protocol/Codec";
import { Constructor } from "../utils/Constructor";
import WorldSessionScope from "./WorldSessionScope";
import { Game } from "phaser";

export default abstract class WorldPacketHandler {
    protected readonly session: WorldSession;
    protected readonly scope: WorldSessionScope;
    protected readonly game: Game;

    public constructor(session: WorldSession) {
        this.session = session;
        this.scope = session.scope;
        this.game = session.game;
    }

    public abstract handle(packet: WorldPacket): void;
}

export abstract class ObjectHandler<T> extends WorldPacketHandler {

    public handle = (packet: WorldPacket): void => {
        this.handleObject(Codec.decode(packet));
    }

    public abstract handleObject(object: T): void;
}

export class WorldPacketHandlerFactory {
    private readonly session: WorldSession;

    constructor(session: WorldSession) {
        this.session = session;
    }

    public handler<T extends WorldPacketHandler>(constructor: Constructor<T>): T {
        return new constructor(this.session);
    }
}

export class NOOPHandler extends WorldPacketHandler {
    public handle(packet: WorldPacket): void {
    }
}
