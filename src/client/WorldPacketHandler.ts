import WorldSession from "./WorldSession";
import WorldPacket from "../protocol/WorldPacket";
import Codec from "../protocol/Codec";
import { Constructor } from "../utils/Constructor";
import WorldScene from "./scene/WorldScene";
import WorldSessionScope from "./WorldSessionScope";

export default abstract class WorldPacketHandler {
    protected readonly session: WorldSession;
    protected readonly scope: WorldSessionScope;
    protected readonly scene: WorldScene;

    public constructor(session: WorldSession) {
        this.session = session;
        this.scope = session.scope;
        this.scene = session.scene;
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
