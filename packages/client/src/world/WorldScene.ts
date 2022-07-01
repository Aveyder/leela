import Preloader from "./Preloader";
import Keys from "./Keys";
import {
    map,
    Opcode,
    PhysicsWorld,
    SIMULATION_RATE,
    TILE_SIZE,
    TILES_HEIGHT,
    TILES_WIDTH,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "@leela/common";
import WorldSession from "../client/WorldSession";
import WorldClient from "../client/WorldClient";
import Unit from "../entities/Unit";
import Loop from "../Loop";
import {playerControl, switchWalkMode} from "../movement/playerControl";
import {DEBUG_MODE, TICK_CAP} from "../config";
import {updatePlayerPosition} from "../movement/playerPrediction";
import DebugManager from "../debugging/DebugManager";
import {updateUnitPositions} from "../movement/unitPositionInterpolation";
import Graphics = Phaser.GameObjects.Graphics;
import UPDATE = Phaser.Scenes.Events.UPDATE;
import Text = Phaser.GameObjects.Text;


export default class WorldScene extends Phaser.Scene {

    private _keys: Keys;

    private _worldClient: WorldClient;
    private _worldSession: WorldSession;

    public _units: Record<number, Unit>;

    public _phys: PhysicsWorld;

    public _tick: number;

    private simulationLoop: Loop;

    private mapGraphics: Graphics;
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
        this._keys = this.input.keyboard.addKeys("W,A,S,D,up,left,down,right,Z") as Keys;

        if (DEBUG_MODE) {
            const debug = new DebugManager(this);
            debug.init();
        }

        this._worldClient = new WorldClient(this);
        this._worldClient.init();

        this._units = {};

        this._phys = new PhysicsWorld(map);

        this._tick = -1;

        this.events.on(UPDATE, this.update, this);

        this.drawMap();
        this.drawShade();
        this.drawJoinButton();
        this.drawDisconnectedText();

        this._keys.Z.on("up", () => {
            switchWalkMode(this._worldSession);
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

    private drawMap() {
        this.mapGraphics = this.add.graphics();

        for(let y = 0; y < TILES_HEIGHT; y++) {
            for(let x = 0; x < TILES_WIDTH; x++) {
                const tile = map[y * TILES_WIDTH + x];

                // this.mapGraphics.lineStyle(1, 0xffffff, 0.1);
                // this.mapGraphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                if (tile == 1) {
                    this.mapGraphics.fillStyle(0x6b2343);
                    this.mapGraphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    private drawShade() {
        this.shadeGraphics = this.add.graphics(this);
        this.shadeGraphics.fillStyle(0x000, 0.65);
        this.shadeGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
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
