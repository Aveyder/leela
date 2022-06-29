import {GUI} from "dat.gui";
import DebugPositionsManager from "./DebugPositionsManager";
import WorldScene from "../world/WorldScene";
import UPDATE = Phaser.Scenes.Events.UPDATE;
import {SERVER_HOST} from "../config";
import {PLAYER_STATE} from "../entities/PlayerState";

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

            const playerState = this.worldScene.worldSession?.player?.getData(PLAYER_STATE);
            const tick = this.worldScene.tick;

            const ackTick = playerState ? playerState.ackTick : "?";
            const unack = playerState ? playerState.appliedControls.length : "?"

            text.text = `ping: ${latency} ms
host: ${SERVER_HOST}
tick: ${tick}
ack: ${ackTick}
unack: ${unack}`;
        });
    }
}
