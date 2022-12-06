import WorldSession from "../server/WorldSession";
import {PhysicsWorld} from "@leela/common";
import {Unit} from "../core/Unit";
import Mob, {spawnCat, spawnVendor, updateMobs} from "../npc/Mob";
import * as map from "@leela/common/map/map.json";
import Plant, {updatePlants} from "../plant/Plant";
import Player, {updatePlayers} from "../player/Player";
import GameObject from "../core/GameObject";

export default class World {

    private _guid: number;

    public readonly sessions: Record<string, WorldSession>;

    private _stopped: boolean;

    public readonly gameObjects: Record<number, GameObject>;
    public readonly units: Record<number, Unit>;
    public readonly players: Record<number, Player>;
    public readonly mobs: Record<number, Mob>;
    public readonly plants: Record<number, Plant>;

    private _physics: PhysicsWorld;

    constructor() {
        this._guid = -1;

        this.sessions = {};

        this._stopped = false;

        this.gameObjects = {};
        this.units = {};
        this.players = {};
        this.mobs = {};
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
