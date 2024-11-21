import WorldSession from "./WorldSession";
import WorldPacket from "../protocol/WorldPacket";
import Codec from "../protocol/Codec";
import { Constructor } from "../utils/Constructor";
import WorldScene from "./world/WorldScene";

export default abstract class WorldPacketHandler {
    private readonly scene: WorldScene;

    public constructor(world: WorldScene) {
        this.scene = world;
    }

    public abstract handle(session: WorldSession, packet: WorldPacket): void;
}

export abstract class ObjectHandler<T> extends WorldPacketHandler {

    public handle = (session: WorldSession, packet: WorldPacket): void => {
        this.handleObject(session, Codec.decode(packet));
    }

    public abstract handleObject(session: WorldSession, object: T): void;
}

export class WorldPacketHandlerFactory {
    private readonly scene: WorldScene;

    constructor(world: WorldScene) {
        this.scene = world;
    }

    public handler<T extends WorldPacketHandler>(constructor: Constructor<T>): T {
        return new constructor(this.scene);
    }
}

export class NOOPHandler extends WorldPacketHandler {
    public handle(session: WorldSession, packet: WorldPacket): void {
    }
}
