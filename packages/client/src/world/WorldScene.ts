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
import Depth from "./Depth";
import Plant from "../entities/Plant";
import Inventory from "../inventory/Inventory";
import CastBar, {updateCastBar} from "../entities/CastBar";
import {initCursor, updateCursor} from "./cursor";
import {getState} from "../entities/PlayerState";
import Graphics = Phaser.GameObjects.Graphics;
import Text = Phaser.GameObjects.Text;
import Image = Phaser.GameObjects.Image;
import POINTER_OVER = Phaser.Input.Events.POINTER_OVER;
import POINTER_OUT = Phaser.Input.Events.POINTER_OUT;
import POINTER_UP = Phaser.Input.Events.POINTER_UP;


export default class WorldScene extends Phaser.Scene {

    public cursor: Image;
    private _keys: Keys;

    private _worldClient: WorldClient;
    private _worldSession: WorldSession;

    private _units: Record<number, Unit>;
    private _plants: Record<number, Plant>;

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
        initCursor(this);

        this._keys = this.input.keyboard.addKeys("W,A,S,D,up,left,down,right,Z") as Keys;

        if (DEBUG_MODE) {
            const debug = new DebugManager(this);
            debug.init();
        }

        this._worldClient = new WorldClient(this);
        this._worldClient.init();

        this._units = {};
        this._plants = {};

        const map = this.cache.tilemap.get("map").data;

        this._phys = new PhysicsWorld({
            data: map.layers.find(layer => layer.name == "collision").data,
            tilesWidth: map.width,
            tilesHeight: map.height,
            tileSize: map.tileheight
        });

        this._tick = -1;

        this.drawShade();
        this.drawJoinButton();
        this.drawDisconnectedText();

        this._keys.Z.on("up", () => switchWalkMode(this._worldSession));

        this.drawTiledMap();
        this.drawInventoryButton();
    }

    public update(time: number, delta: number): void {
        updateCursor(this);
        updatePlayerPosition(this.worldSession?.player, delta);
        updateUnitPositions(this);
        this.updateUnitsDepth();
        updateCastBar(this, delta);
    }

    private updateUnitsDepth() {
        Object.values(this._units).forEach(unit => {
            unit.depth = Depth.UNIT + unit.y / 1000000;
        });
    }

    public addSession(worldSession: WorldSession) {
        this._worldSession = worldSession;

        this.simulationLoop = new Loop();
        this.simulationLoop.start(delta => this.simulate(delta), SIMULATION_RATE);

        this.showMenu();
    }

    public removeSession() {
        getState(this._worldSession.player).destroy();

        this._worldSession = null;

        Object.values(this._units).forEach(unit => unit.destroy());
        Object.values(this._plants).forEach(plant => plant.destroy());

        this._units = {};
        this._plants = {};

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

    public get plants() {
        return this._plants;
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
        this.shadeGraphics.depth = Depth.MENU;
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
            .setInteractive()
            .on("pointerdown", () => {
                this._worldSession.sendPacket([Opcode.MSG_JOIN]);
            });
        this.joinButton.visible = false;
        this.joinButton.depth = Depth.MENU;
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
        this.disconnectedText.depth = Depth.MENU;
    }

    private drawTiledMap() {
        const tilemap = this.add.tilemap("map");

        const baseTileset = tilemap.addTilesetImage("base", "base");
        const grassTileset = tilemap.addTilesetImage("grass", "grass");

        const groundLayer = tilemap.createLayer("ground", [baseTileset, grassTileset]);
        const itemLayer = tilemap.createLayer("item", baseTileset);
        const treeLayer = tilemap.createLayer("tree", baseTileset);
        const buildingLayer = tilemap.createLayer("building", baseTileset);

        groundLayer.depth = Depth.MAP;
        itemLayer.depth = Depth.MAP;
        buildingLayer.depth = Depth.BUILDING;
        treeLayer.depth = Depth.TREE;
    }

    public drawInventory(inventory: Inventory) {
        inventory.setPosition(620, 580);
        inventory.setDepth(Depth.HUD);
        inventory.visible = false;

        this.add.existing(inventory);
    }

    public drawCastBar(castBar: CastBar) {
        castBar.depth = Depth.HUD;
        this.add.existing(castBar);
    }

    private drawInventoryButton() {
        const inventoryButton = this.add.image(620, 620, "bag");
        inventoryButton.setInteractive();
        inventoryButton.setScale(0.66, 0.66);
        inventoryButton.on(POINTER_OVER, () => {
            if (!this.worldSession?.player) return;
            inventoryButton.setScale(0.75, 0.75);
        });
        inventoryButton.on(POINTER_OUT, () => {
            inventoryButton.setScale(0.75, 0.75);
        });
        inventoryButton.on(POINTER_UP, () => {
            const player = this.worldSession?.player;

            if (!player) return;

            const inventory = getState(player).inventory;

            inventory.visible = !inventory.visible;
        });
        inventoryButton.depth = Depth.HUD;
    }
}
