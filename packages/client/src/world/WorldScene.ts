import Preloader from "./Preloader";
import Keys from "./Keys";
import {Opcode, PhysicsWorld, SIMULATION_RATE} from "@leela/common";
import WorldSession from "../client/WorldSession";
import WorldClient from "../client/WorldClient";
import Unit from "../entities/Unit";
import Loop from "../Loop";
import {playerControl, switchWalkMode} from "../movement/playerControl";
import {DEBUG_MODE, GAME_HEIGHT, GAME_WIDTH, TICK_CAP} from "../config";
import {updatePlayerPosition} from "../movement/playerPrediction";
import DebugManager from "../debugging/DebugManager";
import {updateUnitPositions} from "../movement/unitPositionInterpolation";
import Graphics = Phaser.GameObjects.Graphics;
import UPDATE = Phaser.Scenes.Events.UPDATE;
import Text = Phaser.GameObjects.Text;
import * as map from "@leela/common/map/map.json";
import cursor from "../../public/assets/cursor.png";
import cursorPlant from "../../public/assets/cursor-plant.png";


export default class WorldScene extends Phaser.Scene {

    private _keys: Keys;

    private _worldClient: WorldClient;
    private _worldSession: WorldSession;

    public _units: Record<number, Unit>;

    public _phys: PhysicsWorld;

    public _tick: number;

    private simulationLoop: Loop;

    private shadeGraphics: Graphics;
    private joinButton: Text;
    private disconnectedText: Text;

    constructor() {
        super("world");
    }

    public preload(): void {
        const preloader = new Preloader(this);
        preloader.preload();
    }

    public create(): void {
        this.input.setDefaultCursor(`url(${cursor}), pointer`);
        this._keys = this.input.keyboard.addKeys("W,A,S,D,up,left,down,right,Z") as Keys;

        if (DEBUG_MODE) {
            const debug = new DebugManager(this);
            debug.init();
        }

        this._worldClient = new WorldClient(this);
        this._worldClient.init();

        this._units = {};

        const map = this.cache.tilemap.get("map").data;

        this._phys = new PhysicsWorld({
            data: map.layers.find(layer => layer.name == "collision").data,
            tilesWidth: map.width,
            tilesHeight: map.height,
            tileSize: map.tileheight
        });

        this._tick = -1;

        this.events.on(UPDATE, this.update, this);

        this.drawShade();
        this.drawJoinButton();
        this.drawDisconnectedText();

        this._keys.Z.on("up", () => {
            switchWalkMode(this._worldSession);
        });

        const tilemap = this.add.tilemap("map");
        const baseTileset = tilemap.addTilesetImage("base", "base");
        const grassTileset = tilemap.addTilesetImage("grass", "grass");
        tilemap.createLayer("ground", [baseTileset, grassTileset]);
        tilemap.createLayer("item", baseTileset);
        tilemap.createLayer("tree", baseTileset);
        tilemap.createLayer("building", baseTileset);

        const plant = this.add.sprite(500, 400, "base", 52);

        plant.setInteractive({
            cursor: `url(${cursorPlant}), pointer`
        });
    }

    public update(time: number, delta: number): void {
        updatePlayerPosition(this.worldSession?.player, delta);
        updateUnitPositions(this);
    }

    public addSession(worldSession: WorldSession) {
        this._worldSession = worldSession;

        this.simulationLoop = new Loop();
        this.simulationLoop.start(delta => this.simulate(delta), SIMULATION_RATE);

        this.showMenu();
    }

    public removeSession() {
        this._worldSession = null;

        Object.values(this._units).forEach(unit => unit.destroy());

        this._units = {};

        this.simulationLoop.stop();
        this.simulationLoop = null;

        this._tick = -1;

        this.shadeGraphics.visible = true;
        this.joinButton.visible = false;
        this.disconnectedText.visible = true;
    }

    public simulate(delta: number) {
        if (this.worldSession) this._tick = ++this._tick % TICK_CAP;

        playerControl(this);
    }

    public showGame() {
        this.shadeGraphics.visible = false;
        this.joinButton.visible = false;
        this.disconnectedText.visible = false;
    }

    public showMenu() {
        this.shadeGraphics.visible = true;
        this.joinButton.visible = true;
        this.disconnectedText.visible = false;
    }

    public get keys() {
        return this._keys;
    }

    public get worldClient() {
        return this._worldClient;
    }

    public get worldSession() {
        return this._worldSession;
    }

    public get units() {
        return this._units;
    }

    public get phys() {
        return this._phys;
    }

    public get tick() {
        return this._tick;
    }

    private drawShade() {
        this.shadeGraphics = this.add.graphics(this);
        this.shadeGraphics.fillStyle(0x000, 0.65);
        this.shadeGraphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.shadeGraphics.setDepth(999);
    }

    private drawJoinButton() {
        this.joinButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Join Game",  {
            fontSize: "20px",
            fontFamily: "Arial",
            color: "#ffffff",
            backgroundColor: "#000000"
        })
            .setOrigin(0.5)
            .setPadding(10)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this._worldSession.sendPacket([Opcode.MSG_JOIN]);
            });
        this.joinButton.visible = false;
        this.joinButton.setDepth(999);
    }

    private drawDisconnectedText() {
        this.disconnectedText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "You've been disconnected",  {
            fontSize: "20px",
            fontFamily: "Arial",
            color: "#ffffff",
        })
            .setOrigin(0.5)
            .setPadding(10)
            .on("pointerdown", () => {
                this._worldSession.sendPacket([Opcode.MSG_JOIN]);
            });
        this.disconnectedText.visible = false;
        this.disconnectedText.setDepth(999);
    }
}
