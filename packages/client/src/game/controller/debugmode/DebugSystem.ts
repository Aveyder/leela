import Controller from "../Controller";
import {GUI} from "dat.gui";
import DebugPositionsSystem from "./DebugPositionsSystem";

export default class DebugSystem {

    public readonly gui: GUI;

    private readonly positions: DebugPositionsSystem;

    constructor(public readonly controller: Controller) {
        this.gui = new GUI();

        this.positions = new DebugPositionsSystem(this);

        this.init();
    }

    private init() {
        const positionsFolder = this.gui.addFolder("positions");
        positionsFolder.add(this.positions, "showLocalPosition").name("local");
        positionsFolder.add(this.positions, "showRemotePosition").name("remote");
        positionsFolder.add(this.positions, "showReconciledPosition").name("reconciled");
    }
}