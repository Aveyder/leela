import {GUI} from "dat.gui";
import DebugPositionsManager from "./DebugPositionsManager";
import WorldScene from "../world/WorldScene";

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
        positionsFolder.add(this.positions, "showPredictedPosition").name("predicted");
        positionsFolder.add(this.positions, "showReconciledPosition").name("reconciled");
        positionsFolder.add(this.positions, "showLocalPosition").name("local");
    }
}