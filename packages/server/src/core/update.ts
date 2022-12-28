import WorldSession from "../server/WorldSession";
import {FRACTION_DIGITS, Opcode, toFixed, Type, UpdateOpcode, WorldPacket} from "@leela/common";
import {Unit} from "./Unit";
import GameObject, {cloneObject} from "./GameObject";
import Plant from "../plant/Plant";
import Player from "../player/Player";
import Mob from "../npc/Mob";

function sendUpdateToPlayer(worldSession: WorldSession) {
    const gameObjectUpdates = [];

    Object.values(worldSession.world.gameObjects).forEach(gameObject => {
        const guid = gameObject.guid;
        const sessionGameObject = worldSession.gameObjects[guid];

        pushGameObjectUpdates(
            guid,
            gameObject,
            sessionGameObject,
            gameObjectUpdates,
            worldSession
        );

        worldSession.gameObjects[guid] = cloneObject(gameObject, sessionGameObject) as Unit;
    });

    if (gameObjectUpdates.length) {
        const packet = [
            Opcode.SMSG_UPDATE,
            Date.now(),
            ...gameObjectUpdates
        ] as WorldPacket;

        worldSession.sendPacket(packet);
    }
}

function pushGameObjectUpdates(guid: number, gameObject: GameObject, sessionGameObject: GameObject,
                              gameObjectUpdates: unknown[], worldSession: WorldSession) {
    if (gameObject.static && sessionGameObject) return;

    switch (gameObject.typeId) {
        case Type.MOB:
            pushMobUpdates(guid, gameObject as Mob, sessionGameObject as Mob, gameObjectUpdates);
            break;
        case Type.PLAYER:
            pushPlayerUpdates(guid, gameObject as Player, sessionGameObject as Player, gameObjectUpdates, worldSession);
            break;
        case Type.PLANT:
            pushPlantUpdates(guid, gameObject as Plant, gameObjectUpdates);
            break;
    }
}

function pushMobUpdates(guid: number, mob: Mob, sessionMob: Mob,
                       gameObjectUpdates: unknown[]) {
    pushUnitUpdates(guid, mob as Unit, sessionMob as Unit, gameObjectUpdates);
}

function pushPlayerUpdates(guid: number, player: Player, sessionPlayer: Player,
                          gameObjectUpdates: unknown[], worldSession: WorldSession) {
    pushUnitUpdates(guid, player as Unit, sessionPlayer as Unit, gameObjectUpdates);

    if (worldSession.player != player) return;

    if (!sessionPlayer) {
        gameObjectUpdates.push(UpdateOpcode.PLAYER_INV,
            guid,
            serializeInventory(player),
            player.gold
        );
    }

    if (sessionPlayer?.speed != player.speed) {
        gameObjectUpdates.push(UpdateOpcode.PLAYER_SPEED,
            guid,
            player.speed
        );
    }

    if (sessionPlayer?.tick != player.tick) {
        gameObjectUpdates.push(UpdateOpcode.PLAYER_ACK,
            guid,
            player.tick
        );
    }
}

function serializeInventory(player: Player) {
    const inventory = [];
    player.inventory.forEach(item => {
        if (item) {
            inventory.push(item.id, item.stack);
        } else {
            inventory.push(0);
        }
    });
    return inventory;
}

function pushUnitUpdates(guid: number, unit: Unit, sessionUnit: Unit,
                          gameObjectUpdates: unknown[]) {
    if (!sessionUnit) {
        gameObjectUpdates.push(UpdateOpcode.UNIT_NEW,
            guid,
            unit.typeId,
            unit.roles,
            unit.name
        );
    }

    if (!sessionUnit || hasPositionChanged(unit, sessionUnit)) {
        gameObjectUpdates.push(UpdateOpcode.UNIT_POS,
            guid,
            toFixed(unit.x, FRACTION_DIGITS),
            toFixed(unit.y, FRACTION_DIGITS),
            toFixed(unit.vx, FRACTION_DIGITS),
            toFixed(unit.vy, FRACTION_DIGITS)
        );
    } else {
        gameObjectUpdates.push(UpdateOpcode.UNIT_ACK, guid);
    }

    if (sessionUnit?.skin != unit.skin) {
        gameObjectUpdates.push(UpdateOpcode.UNIT_SKIN,
            guid,
            unit.skin
        );
    }
}

function hasPositionChanged(unitA: Unit, unitB: Unit) {
    return unitA.x != unitB.x ||
        unitA.y != unitB.y ||
        unitA.vx != unitB.vx ||
        unitA.vy != unitB.vy;
}

function pushPlantUpdates(guid: number, plant: Plant, gameObjectUpdates: unknown[]) {
    gameObjectUpdates.push(UpdateOpcode.PLANT,
        guid,
        toFixed(plant.x, FRACTION_DIGITS),
        toFixed(plant.y, FRACTION_DIGITS),
        plant.kind
    );
}

export {
    sendUpdateToPlayer,
}