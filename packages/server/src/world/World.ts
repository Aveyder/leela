import WorldSession from "../server/WorldSession";
import {PhysicsWorld} from "@leela/common";
import {Unit} from "../entities/Unit";
import {spawnCat, spawnVendor, updateMobs} from "../entities/Mob";
import * as map from "@leela/common/map/map.json";

export default class World {

    private _guid: number;

    public readonly sessions: Record<string, WorldSession>;

    private _stopped: boolean;

    public readonly units: Record<number, Unit>;

    private _physics: PhysicsWorld;

    constructor() {
        this._guid = -1;

        this.sessions = {};

        this._stopped = false;

        this.units = {};
    }

    public init(): void {
        this._physics = new PhysicsWorld({
            data: map.layers.find(layer => layer.name == "collision").data,
            tilesWidth: map.width,
            tilesHeight: map.height,
            tileSize: map.tileheight
        });

        spawnCat(this);
        spawnVendor(this);
    }

    public guid(): number {
        return ++this._guid;
    }

    public get stopped() {
        return this._stopped;
    }

    public stop() {
        this._stopped = true;
    }

    public get physics() {
        return this._physics;
    }

    public addSession(session: WorldSession): void {
        this.sessions[session.id] = session;
    }

    public removeSession(session: WorldSession): void {
        delete this.sessions[session.id];
    }

    public update(delta: number): void {
        this.updateSessions(delta);
        updateMobs(this, delta);
    }

    private updateSessions(delta: number) {
        this.forEachSession(session => session.update(delta));
    }

    public forEachSession(callback: (session: WorldSession) => void) {
        Object.values(this.sessions).forEach(session => callback(session));
    }
}
