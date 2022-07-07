import {GUI} from "dat.gui";
import DebugPositionsManager from "./DebugPositionsManager";
import WorldScene from "../world/WorldScene";
import {SERVER_HOST} from "../config";
import {getPlayerState} from "../player/PlayerState";
import Depth from "../world/Depth";
import Text = Phaser.GameObjects.Text;

export default class DebugManager {

    private readonly worldScene: WorldScene;
    public readonly gui: GUI;

    private positions: DebugPositionsManager;

    private text: Text;

    constructor(worldScene: WorldScene) {
        this.worldScene = worldScene;
        this.gui = new GUI();
    }

    public init(): void {
        this.positions = new DebugPositionsManager(this.worldScene);
        this.positions.init();

        const positionsFolder = this.gui.addFolder("positions");
        positionsFolder.add(this.positions, "showRemotePosition").name("remote");
        positionsFolder.add(this.positions, "showInitialPosition").name("initial");
        positionsFolder.add(this.positions, "showPredictedPosition").name("predicted");
        positionsFolder.add(this.positions, "showTargetPosition").name("target");
        positionsFolder.add(this.positions, "showReconciledPosition").name("reconciled");
        positionsFolder.add(this.positions, "showLocalPosition").name("local");

        this.initDebugInfo();
    }

    public update() {
        this.positions.update();
        this.updateDebugInfo();
    }

    private initDebugInfo() {
        this.text = this.worldScene.add.text(0, 0, "", {
            fontSize: "12px",
            backgroundColor: "rgba(0,0,0,0.5)"
        });
        this.text.depth = Depth.DEBUG;
    }

    private updateDebugInfo() {
        const latency = this.worldScene.worldSession?.latency as number;

        const displayLatency = (latency != undefined) ? String(latency) : "?";

        const player = this.worldScene.worldSession?.player;
        const playerState = getPlayerState(player);
        const tick = this.worldScene.tick;

        const ackTick = playerState ? playerState.ackTick : "?";
        const unack = playerState ? playerState.appliedControls.length : "?"

        this.text.text = `ping: ${displayLatency} ms
host: ${SERVER_HOST}
tick: ${tick}
ack: ${ackTick}
unack: ${unack}`;
    }

    public destroy() {
        this.text.destroy();
        this.gui.destroy();
        this.positions.destroy();
    }
}
