import Preloader from "./Preloader";
import {initKeys, Keys} from "./keys";
import {PhysicsWorld, SIMULATION_RATE} from "@leela/common";
import WorldSession from "../client/WorldSession";
import WorldClient from "../client/WorldClient";
import Unit from "../core/Unit";
import Loop from "../utils/Loop";
import {movement} from "../player/movement";
import {DEBUG_MODE, TICK_CAP} from "../config";
import {updatePlayerPosition} from "../player/prediction";
import DebugManager from "../debugging/DebugManager";
import {updateUnitPositions, updateUnitsDepth} from "../movement/unit";
import Plant from "../plant/Plant";
import {updateCastBar} from "../plant/CastBar";
import {initCursor, updateCursor} from "./cursor";
import {getPlayerState} from "../player/PlayerState";
import {drawTiledMap} from "./map";
import GameMenu, {initGameMenu} from "../gui/GameMenu";
import {initPhysicsWorld} from "../physics/init";
import {initHUD} from "../gui/hud";
import Image = Phaser.GameObjects.Image;


export default class WorldScene extends Phaser.Scene {

    private _gameMenu: GameMenu;

    private _cursor: Image;

    private _keys: Keys;

    public _phys: PhysicsWorld;

    private debug: DebugManager;

    private _units: Record<number, Unit>;
    private _plants: Record<number, Plant>;

    public _tick: number;

    private _worldClient: WorldClient;
    private _worldSession: WorldSession;

    private simulationLoop: Loop;

    constructor() {
        super("world");
    }

    public preload(): void {
        const preloader = new Preloader(this);
        preloader.preload();
    }

    public create(): void {
        drawTiledMap(this);
        initHUD(this);

        this._gameMenu = initGameMenu(this);

        this._cursor = initCursor(this);

        this._keys = initKeys(this);

        if (DEBUG_MODE) {
            this.debug = new DebugManager(this);
            this.debug.init();
        }

        this._phys = initPhysicsWorld(this);

        this._units = {};
        this._plants = {};

        this._tick = -1;

        this._worldClient = new WorldClient(this);
        this._worldClient.init();
    }

    public update(time: number, delta: number): void {
        updatePlayerPosition(this.worldSession?.player, delta);
        updateUnitPositions(this);
        updateUnitsDepth(this);
        updateCastBar(this, delta);
        updateCursor(this);
        this.debug.update();
    }

    public addSession(worldSession: WorldSession) {
        this._worldSession = worldSession;

        this.simulationLoop = new Loop();
        this.simulationLoop.start(delta => this.simulate(delta), SIMULATION_RATE);

        this._gameMenu.showJoinMenu();
    }

    public removeSession() {
        getPlayerState(this._worldSession.player)?.destroy();

        Object.values(this._units).forEach(unit => unit.destroy());
        Object.values(this._plants).forEach(plant => plant.destroy());

        this._units = {};
        this._plants = {};

        this._tick = -1;

        this._worldSession = null;

        this.simulationLoop.stop();
        this.simulationLoop = null;

        this._gameMenu.showDisconnectedMenu();
    }

    public simulate(delta: number) {
        if (this.worldSession) this._tick = ++this._tick % TICK_CAP;

        movement(this);
    }

    public get gameMenu() {
        return this._gameMenu;
    }

    public get cursor() {
        return this._cursor;
    }

    public get keys() {
        return this._keys;
    }

    public get phys() {
        return this._phys;
    }

    public get units() {
        return this._units;
    }

    public get plants() {
        return this._plants;
    }

    public get tick() {
        return this._tick;
    }

    public get worldClient() {
        return this._worldClient;
    }

    public get worldSession() {
        return this._worldSession;
    }
}
