import World from "../world/World";
import {_addUnitToWorld, _deleteUnitFromWorld, Unit} from "../core/Unit";
import {Role, TILE_SIZE, Type, UNIT_BODY_HEIGHT, UNIT_BODY_WIDTH, UNIT_WALK_SPEED} from "@leela/common";
import {Motion, PathMotion, Waypoint} from "./motions";

export default class Mob implements Unit {
    public guid: number;
    public readonly typeId: number;
    public readonly static: boolean;
    public readonly roles: Role[];
    public skin: number;
    public name: string;
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public readonly width: number;
    public readonly height: number;
    public readonly bullet: boolean;
    public motion: Motion;
    public speed: number;

    public readonly world: World;

    constructor(world: World) {
        this.world = world;

        this.typeId = Type.MOB;
        this.static = false;
        this.roles = [];
        this.width = UNIT_BODY_WIDTH;
        this.height = UNIT_BODY_HEIGHT;
        this.bullet = false;
    }

    public addToWorld() {
        this.world.mobs[this.guid] = this;

        _addUnitToWorld(this);
    }

    public deleteFromWorld() {
        delete this.world.mobs[this.guid];

        _deleteUnitFromWorld(this);
    }
}

function updateMobs(world: World, delta) {
    Object.values(world.mobs)
        .forEach(mob => mob.motion?.update(delta));
}

function spawnCat(world: World) {
    const mob = new Mob(world);

    mob.guid = world.guid();
    mob.skin = 5;
    mob.name = "Fluffy";
    mob.x = TILE_SIZE * 3 / 2 + TILE_SIZE * 15;
    mob.y = TILE_SIZE * 3 / 2;
    mob.vx = 0;
    mob.vy = 0;
    mob.speed = UNIT_WALK_SPEED;

    const path = [
        [{x: TILE_SIZE * 3 / 2 + TILE_SIZE * 15, y: TILE_SIZE * 3 / 2}, 5],
        [{x: TILE_SIZE * 3 / 2 + TILE_SIZE * 15, y: TILE_SIZE * 3 / 2 + TILE_SIZE * 4}, 0],
        [{x: TILE_SIZE * 3 / 2 + TILE_SIZE * 17, y: TILE_SIZE * 3 / 2 + TILE_SIZE * 4}, 5],
        [{x: TILE_SIZE * 3 / 2 + TILE_SIZE * 13,  y: TILE_SIZE * 3 / 2 + TILE_SIZE * 7}, 5],
        [{x: TILE_SIZE * 3 / 2 + TILE_SIZE * 15, y: TILE_SIZE * 3 / 2 + TILE_SIZE * 2}, 0],
    ];

    mob.motion = new PathMotion(mob, path as Waypoint[]);

    mob.addToWorld();
}

function spawnVendor(world: World) {
    const mob = new Mob(world);

    mob.guid = world.guid();
    mob.skin = 6;
    mob.name = "Patrick Sharp";
    mob.x = TILE_SIZE * 3 / 2 + TILE_SIZE * 16;
    mob.y = TILE_SIZE * 3 / 2;
    mob.vx = 0;
    mob.vy = 0;

    mob.roles.push(Role.VENDOR);

    mob.addToWorld();
}

export {
    updateMobs,
    spawnCat,
    spawnVendor
}
