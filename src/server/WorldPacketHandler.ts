import WorldSession from "./WorldSession";
import WorldPacket from "../protocol/WorldPacket";
import Codec from "../protocol/Codec";
import World from "./world/World";
import { Constructor } from "../utils/Constructor";
import WorldSessionScope from "./WorldSessionScope";

export default abstract class WorldPacketHandler {
    protected readonly session: WorldSession;
    protected readonly scope: WorldSessionScope;
    protected readonly world: World;

    public constructor(session: WorldSession) {
        this.session = session;
        this.scope = session.scope;
        this.world = session.scope.world;
    }

    public abstract handle(packet: WorldPacket, delta: number): void;
}

export abstract class ObjectHandler<T> extends WorldPacketHandler {

    public handle = (packet: WorldPacket, delta: number): void => {
        this.handleObject(Codec.decode(packet), delta);
    }

    public abstract handleObject(object: T, delta: number): void;
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
    public handle(packet: WorldPacket, delta: number): void {
    }
}
