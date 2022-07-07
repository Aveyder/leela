import {Body, Vec2} from "@leela/common";
import Inventory from "../inventory/Inventory";
import WorldScene from "../world/WorldScene";
import CastBar from "../plant/CastBar";
import Plant from "../plant/Plant";
import Unit from "../core/Unit";
import {drawCastBar, drawInventory} from "../gui/hud";
import WorldSession from "../client/WorldSession";


type Control = {dir: Vec2, tick: number};

const PLAYER_STATE_KEY = "player_state";

export default class PlayerState {

    private readonly worldScene: WorldScene;

    public appliedControls: Control[];

    public lerpStartTime: number;
    public lerpDuration: number;

    public initialPos: Vec2;
    public predictedBody: Body;
    public targetPos: Vec2;
    public reconciledBody: Body;

    public ackTick: number;

    public errorTimer: number;

    public lastMoveInput: number;

    public speed: number;
    public run: boolean;

    public readonly inventory: Inventory;
    public readonly castBar: CastBar;

    public gatheringPlant: Plant;

    constructor(worldScene: WorldScene) {
        this.worldScene = worldScene;

        this.appliedControls = [];

        this.lerpStartTime = -1;
        this.lerpDuration = -1;

        this.initialPos = {x: 0, y: 0};
        this.predictedBody = new Body();
        this.targetPos = {x: 0, y: 0};
        this.reconciledBody = new Body();

        this.ackTick = null;

        this.errorTimer = -1;

        this.lastMoveInput = null;

        this.speed = 0;
        this.run = true;

        this.inventory = new Inventory(worldScene);
        this.castBar = new CastBar(worldScene);

        this.gatheringPlant = null;
    }

    public draw() {
        drawInventory(this.worldScene, this.inventory);
        drawCastBar(this.worldScene, this.castBar);
    }

    public destroy() {
        this.inventory.destroy();
        this.castBar.destroy();
    }
}

function initPlayerState(player: Unit) {
    const playerState = new PlayerState(player.scene as WorldScene);

    player.setData(PLAYER_STATE_KEY, playerState);

    return playerState;
}

function getPlayerState(player: Unit) {
    return player?.getData(PLAYER_STATE_KEY) as PlayerState;
}

function removePlayerFromWorldSession(worldSession: WorldSession) {
    getPlayerState(worldSession.player)?.destroy();

    worldSession.playerGuid = null;
    worldSession.player = null;
}

export {
    Control,
    initPlayerState,
    getPlayerState,
    removePlayerFromWorldSession
}
