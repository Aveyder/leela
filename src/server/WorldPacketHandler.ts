import WorldSession from "./WorldSession";
import WorldPacket from "../protocol/WorldPacket";
import Codec from "../protocol/Codec";
import World from "./world/World";
import { Constructor } from "../utils/Constructor";

export default abstract class WorldPacketHandler {
    protected readonly world: World;

    public constructor(world: World) {
        this.world = world;
    }

    public abstract handle(session: WorldSession, packet: WorldPacket, delta: number): void;
}

export abstract class ObjectHandler<T> extends WorldPacketHandler {

    public handle = (session: WorldSession, packet: WorldPacket, delta: number): void => {
        this.handleObject(session, Codec.decode(packet), delta);
    }

    public abstract handleObject(session: WorldSession, object: T, delta: number): void;
}

export class WorldPacketHandlerFactory {
    private readonly world: World;

    constructor(world: World) {
        this.world = world;
    }

    public handler<T extends WorldPacketHandler>(constructor: Constructor<T>): T {
        return new constructor(this.world);
    }
}

export class NOOPHandler extends WorldPacketHandler {
    public handle(session: WorldSession, packet: WorldPacket, delta: number): void {
    }
}
