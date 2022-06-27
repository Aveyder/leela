import {GUI} from "dat.gui";
import DebugPositionsManager from "./DebugPositionsManager";
import WorldScene from "../world/WorldScene";
import {PlayerKey} from "../entities/PlayerKey";
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class DebugManager {

    private readonly worldScene: WorldScene;
    public readonly gui: GUI;

    private positions: DebugPositionsManager;

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

    private initDebugInfo() {
        const text = this.worldScene.add.text(0, 0, "", {
            fontSize: "12px",
            backgroundColor: "rgba(0,0,0,0.5)"
        });
        text.setDepth(1000);

        this.worldScene.events.on(UPDATE, () => {
            let latency = String(this.worldScene.worldSession?.latency);

            if (latency == undefined) latency = "?";

            const player = this.worldScene.worldSession?.player;
            const tick = this.worldScene.tick;
            const acktick = player ? player.getData(PlayerKey.PREDICTION_ACK_TICK) : "?";
            const uncofirmed = player ? player.getData(PlayerKey.PREDICTION_APPLIED_CONTROLS).length : "?"

            text.text = `ping: ${latency} ms
tick: ${tick}
ack: ${acktick}
unack: ${uncofirmed}`;
        });
    }
}
