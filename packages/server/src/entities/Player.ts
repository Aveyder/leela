import WorldSession from "../server/WorldSession";
import {Unit} from "./Unit";
import {FRACTION_DIGITS, Opcode, toFixed, Type, UNIT_BODY_HEIGHT, UNIT_BODY_WIDTH, WorldPacket} from "@leela/common";

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

    private readonly _session: WorldSession;

    constructor(worldSession: WorldSession) {
        this._session = worldSession;

        this.typeId = Type.PLAYER;
        this.width = UNIT_BODY_WIDTH;
        this.height = UNIT_BODY_HEIGHT;
        this.bullet = false;
    }

    public get session() {
        return this._session;
    }

    public get world() {
        return this._session.world;
    }
}

function sendUpdateToPlayer(worldSession: WorldSession) {
    const player = worldSession.player;

    const units = worldSession.world.units;

    const packet = [Opcode.SMSG_UPDATE, Date.now(), player?.tick == undefined ? -1 : player.tick] as WorldPacket;

    Object.values(units).forEach(unit => pushSerializedUnit(player, unit, packet));

    worldSession.sendPacket(packet);
}

function pushSerializedUnit(player: Player, unit: Unit, worldPacket: WorldPacket) {
    worldPacket.push(
        unit.guid,
        unit.typeId,
        toFixed(unit.x, FRACTION_DIGITS),
        toFixed(unit.y, FRACTION_DIGITS),
        unit.skin,
        toFixed(unit.vx, FRACTION_DIGITS),
        toFixed(unit.vy, FRACTION_DIGITS)
    )
}

export {
    sendUpdateToPlayer
}
