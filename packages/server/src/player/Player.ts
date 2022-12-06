import WorldSession from "../server/WorldSession";
import {_addUnitToWorld, _deleteUnitFromWorld, Unit} from "../core/Unit";
import {INVENTORY_SIZE, Role, Type, UNIT_BODY_HEIGHT, UNIT_BODY_WIDTH} from "@leela/common";
import Plant from "../plant/Plant";
import Item from "../core/Item";
import World from "../world/World";
import {resetGathering, updateGathering} from "../plant/gather";
import SessionStatus from "../server/protocol/SessionStatus";

export default class Player implements Unit {
    public guid: number;
    public readonly typeId: number;
    public readonly static: boolean;
    public readonly roles: Role[];
    public skin: number;
    public name: string;
    public x: number;
    public y: number;
    public vx: number;
    public vy: number
    public readonly width: number;
    public readonly height: number;
    public readonly bullet: boolean;
    public tick: number;
    public speed: number;
    public run: boolean;
    public readonly inventory: Item[];
    public gatheringPlant: Plant;
    public gatheringTimer: number;
    public gold: number;

    private readonly _worldSession: WorldSession;

    constructor(worldSession: WorldSession) {
        this._worldSession = worldSession;

        this.typeId = Type.PLAYER;
        this.static = false;
        this.roles = null;
        this.width = UNIT_BODY_WIDTH;
        this.height = UNIT_BODY_HEIGHT;
        this.bullet = false;
        this.run = true;
        this.inventory = [];
        resetGathering(this);
        for(let i = 0; i < INVENTORY_SIZE; i++) this.inventory.push(null);
    }

    public get worldSession() {
        return this._worldSession;
    }

    public get world() {
        return this._worldSession.world;
    }

    public addToWorld() {
        this.worldSession.status = SessionStatus.STATUS_IN_GAME;
        this.worldSession.player = this;

        this.world.players[this.guid] = this;

        _addUnitToWorld(this);
    }

    public deleteFromWorld() {
        this.worldSession.status = SessionStatus.STATUS_AUTHED;
        this.worldSession.player = null;

        delete this.world.players[this.guid];

        _deleteUnitFromWorld(this);
    }
}

function updatePlayers(world: World, delta: number) {
    Object.values(world.players)
        .forEach(player => updatePlayer(player, delta));
}

function updatePlayer(player: Player, delta: number) {
    updateGathering(player, delta);
}

export {
    updatePlayers
}
