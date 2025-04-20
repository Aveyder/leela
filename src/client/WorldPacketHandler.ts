import WorldPacket from "../protocol/WorldPacket";
import Codec from "../protocol/Codec";
import { Constructor } from "../utils/Constructor";
import GameContext from "./GameContext";

export default abstract class WorldPacketHandler {
    protected readonly context: GameContext;

    public constructor(context: GameContext) {
        this.context = context;
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
    private readonly context: GameContext;

    constructor(context: GameContext) {
        this.context = context;
    }

    public handler<T extends WorldPacketHandler>(constructor: Constructor<T>): T {
        return new constructor(this.context);
    }
}

export class NOOPHandler extends WorldPacketHandler {
    public handle(packet: WorldPacket): void {
    }
}
