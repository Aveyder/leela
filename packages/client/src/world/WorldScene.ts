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
import TimeStepLoop from "../TimeStepLoop";
import {playerControl} from "../movement/playerControl";
import {DEBUG_MODE} from "../config";
import {lerpPredictedPlayerPosition} from "../movement/playerPositionPrediction";
import DebugManager from "../debugging/DebugManager";
import {interpolateUnitPositions} from "../movement/unitPositionInterpolation";
import Graphics = Phaser.GameObjects.Graphics;
import UPDATE = Phaser.Scenes.Events.UPDATE;
import Text = Phaser.GameObjects.Text;


export default class WorldScene extends Phaser.Scene {

    private _keys: Keys;

    private mapGraphics: Graphics;
    private shade: Graphics;
    private joinButton: Text;
    private disconnectedText: Text;

    private _worldClient: WorldClient;
    private _worldSession: WorldSession;

    public _units: Record<number, Unit>;

    private loop: TimeStepLoop;

    public _tick: number;

    public _phys: PhysicsWorld;

    constructor() {
        super("world");
    }

    public preload(): void {
        const preloader = new Preloader(this);
        preloader.preload();
    }

    public create(): void {
        this._keys = this.input.keyboard.addKeys("W,A,S,D,up,left,down,right") as Keys;

        if (DEBUG_MODE) {
            const debug = new DebugManager(this);
            debug.init();
        }

        this.drawMap();
        this.drawShade();
        this.drawJoinButton();
        this.drawDisconnectedText();
        this.drawPing();

        this._worldClient = new WorldClient(this);
        this._worldClient.init();

        this._units = {};

        this._tick = -1;

        this._phys = new PhysicsWorld(map);

        this.events.on(UPDATE, this.update, this);
    }

    public get keys() {
        return this._keys;
    }

    private drawMap() {
        this.mapGraphics = this.add.graphics();

        for(let y = 0; y < TILES_HEIGHT; y++) {
            for(let x = 0; x < TILES_WIDTH; x++) {
                const tile = map[y * TILES_WIDTH + x];

                this.mapGraphics.lineStyle(1, 0xffffff, 0.1);
                this.mapGraphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                if (tile == 1) {
                    this.mapGraphics.fillStyle(0x6b2343);
                    this.mapGraphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    private drawShade() {
        this.shade = this.add.graphics(this);
        this.shade.fillStyle(0x000, 0.65);
        this.shade.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.shade.setDepth(999);
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

    private drawPing() {
        const pingText = this.add.text(0, 0, "");
        pingText.setDepth(999);

        this.events.on(UPDATE, () => {
            let latency = String(this._worldSession?.latency);

            if (latency == undefined) latency = "?";

            pingText.text = `ping: ${latency} ms`;
        });
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

    public get tick() {
        return this._tick;
    }

    public get phys() {
        return this._phys;
    }

    public update(time: number, delta: number): void {
        lerpPredictedPlayerPosition(this.worldSession?.player, delta);
        interpolateUnitPositions(this);
    }

    public addSession(worldSession: WorldSession) {
        this._worldSession = worldSession;

        this.shade.visible = true;
        this.joinButton.visible = true;
        this.disconnectedText.visible = false;

        this.loop = new TimeStepLoop();
        this.loop.start(delta => this.simulate(delta), SIMULATION_RATE);
    }

    public simulate(delta: number) {
        if (this.worldSession) this._tick++;

        playerControl(this);
    }

    public removeSession(worldSession: WorldSession) {
        this._worldSession = null;

        this.shade.visible = true;
        this.joinButton.visible = false;
        this.disconnectedText.visible = true;

        Object.values(this.units).forEach(unit => unit.destroy());

        this._units = {};

        this.loop.stop();

        this._tick = -1;
    }

    public joinGame() {
        this.shade.visible = false;
        this.joinButton.visible = false;
        this.disconnectedText.visible = false;
    }
}
