import WorldSession from "../server/WorldSession";
import {cloneUnit, Unit} from "./Unit";
import {
    FRACTION_DIGITS,
    Opcode,
    toFixed,
    Type,
    UNIT_BODY_HEIGHT,
    UNIT_BODY_WIDTH,
    Update,
    WorldPacket
} from "@leela/common";

export default class Player implements Unit {
    public guid: number;
    public readonly typeId: number;
    public skin: number;
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

    private readonly _worldSession: WorldSession;

    constructor(worldSession: WorldSession) {
        this._worldSession = worldSession;

        this.typeId = Type.PLAYER;
        this.width = UNIT_BODY_WIDTH;
        this.height = UNIT_BODY_HEIGHT;
        this.bullet = false;
        this.run = true;
    }

    public get worldSession() {
        return this._worldSession;
    }

    public get world() {
        return this._worldSession.world;
    }
}

function sendUpdateToPlayer(worldSession: WorldSession) {
    const player = worldSession.player;

    const units = worldSession.world.units;

    const serializedUnitUpdates = [];

    Object.values(units).forEach(unit => pushSerializedUnitUpdate(worldSession, unit, serializedUnitUpdates));

    if (serializedUnitUpdates.length) {
        const packet = [
            Opcode.SMSG_UPDATE,
            Date.now(),
            player?.tick == undefined ? -1 : player.tick,
            player?.speed,
            ...serializedUnitUpdates
        ] as WorldPacket;

        worldSession.sendPacket(packet);
    }
}

function pushSerializedUnitUpdate(worldSession: WorldSession, unit: Unit, unitUpdates: unknown[]) {
    const lastSentUnitUpdate = worldSession.lastSentUpdate[unit.guid];

    if (!lastSentUnitUpdate) {
        pushSerializedFullUnitUpdate(unit, unitUpdates);
    } else {
        if (lastSentUnitUpdate.skin != unit.skin) {
            pushSerializedSkinUnitUpdate(unit, unitUpdates);
        }
        if (lastSentUnitUpdate.x != unit.x ||
            lastSentUnitUpdate.y != unit.y ||
            lastSentUnitUpdate.vx != unit.vx ||
            lastSentUnitUpdate.vy != unit.vy) {
            pushSerializedPositionUnitUpdate(unit, unitUpdates);
        } else {
            pushSerializedEmptyUnitUpdate(unit, unitUpdates);
        }
    }

    worldSession.lastSentUpdate[unit.guid] = cloneUnit(unit, lastSentUnitUpdate);
}

function pushSerializedFullUnitUpdate(unit: Unit, unitUpdates: unknown[]) {
    unitUpdates.push(Update.FULL,
        unit.guid,
        unit.typeId,
        toFixed(unit.x, FRACTION_DIGITS),
        toFixed(unit.y, FRACTION_DIGITS),
        unit.skin,
        toFixed(unit.vx, FRACTION_DIGITS),
        toFixed(unit.vy, FRACTION_DIGITS)
    );
}

function pushSerializedSkinUnitUpdate(unit: Unit, unitUpdates: unknown[]) {
    unitUpdates.push(Update.SKIN,
        unit.guid,
        unit.skin
    );
}

function pushSerializedPositionUnitUpdate(unit: Unit, unitUpdates: unknown[]) {
    unitUpdates.push(Update.POSITION,
        unit.guid,
        toFixed(unit.x, FRACTION_DIGITS),
        toFixed(unit.y, FRACTION_DIGITS),
        toFixed(unit.vx, FRACTION_DIGITS),
        toFixed(unit.vy, FRACTION_DIGITS)
    );
}

function pushSerializedEmptyUnitUpdate(unit: Unit, unitUpdates: unknown[]) {
    unitUpdates.push(Update.EMPTY,
        unit.guid
    );
}


export {
    sendUpdateToPlayer
}
