import WorldSession from "../server/WorldSession";
import {PhysicsWorld} from "@leela/common";
import {Unit} from "../core/Unit";
import {spawnCat, spawnVendor, updateMobs} from "../npc/Mob";
import * as map from "@leela/common/map/map.json";
import Plant, {updatePlants} from "../plant/Plant";
import {updatePlayers} from "../player/Player";

export default class World {

    private _guid: number;

    public readonly sessions: Record<string, WorldSession>;

    private _stopped: boolean;

    public readonly units: Record<number, Unit>;
    public readonly plants: Record<number, Plant>;

    private _physics: PhysicsWorld;

    constructor() {
        this._guid = -1;

        this.sessions = {};

        this._stopped = false;

        this.units = {};
        this.plants = {};
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
        updatePlayers(this, delta);
        updatePlants(this);
    }

    private updateSessions(delta: number) {
        this.forEachSession(session => session.update(delta));
    }

    public forEachSession(callback: (session: WorldSession) => void) {
        Object.values(this.sessions).forEach(session => callback(session));
    }
}
