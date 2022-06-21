import WorldSession from "../server/WorldSession";
import {Type} from "./Type";
import {Unit} from "./Unit";

export default class Player implements Unit {
    public guid: number;
    public type: number;
    public skin: number;
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public tick: number;

    private readonly _session: WorldSession;

    constructor(worldSession: WorldSession) {
        this._session = worldSession;

        this.type = Type.PLAYER;
    }

    public get session() {
        return this._session;
    }

    public get world() {
        return this._session.world;
    }
}
