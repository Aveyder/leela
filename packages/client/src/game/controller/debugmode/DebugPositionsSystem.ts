import {Char as CharSnapshot, CHAR_SIZE, EntityType, MessageSystem, Opcode, Snapshot} from "@leela/common";
import Char from "../../world/view/Char";
import Controller from "../Controller";
import WorldScene from "../../world/WorldScene";
import DebugSystem from "./DebugSystem";
import Graphics = Phaser.GameObjects.Graphics;
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class DebugPositionsSystem {

    public showLocalPosition = true;
    public showRemotePosition = true;
    public showReconciledPosition = true;

    private readonly controller: Controller;
    private readonly worldScene: WorldScene;
    private readonly messages: MessageSystem;

    private graphics: Graphics;

    private snapshot: Snapshot;

    constructor(private readonly debug: DebugSystem) {
        this.controller = this.debug.controller;
        this.worldScene = this.controller.worldScene;
        this.messages = this.controller.network.messages;

        this.init();
    }

    private init() {
        this.graphics = this.worldScene.add.graphics();
        this.graphics.setDepth(1000);

        this.messages.on(Opcode.Snapshot, (snapshot: Snapshot) => {
            this.snapshot = snapshot;

            this.drawPositions();
        });

        this.worldScene.events.on(UPDATE, () => this.drawPositions());
    }

    private drawPositions() {
        this.graphics.clear();

        if (this.showRemotePosition) this.drawRemotePosition();
        if (this.showReconciledPosition) this.drawReconciledPosition();
        if (this.showLocalPosition) this.drawLocalPosition();
    }

    private drawRemotePosition() {
        this.graphics.lineStyle(2, 0xcc00aa);

        const chars = this.controller.chars;

        this.snapshot?.forEach(entity => {
            if (entity.type == EntityType.CHAR) {
                const remoteChar = entity as CharSnapshot;
                this.graphics.strokeRect(remoteChar.x - CHAR_SIZE / 2, remoteChar.y - CHAR_SIZE / 2, CHAR_SIZE, CHAR_SIZE);

                const localChar = chars[entity.id];
                if (localChar) this.graphics.lineBetween(remoteChar.x, remoteChar.y, localChar.x, localChar.y);
            }
        });
    }

    private drawLocalPosition() {
        const chars = this.controller.chars;

        this.graphics.lineStyle(2, 0x87e56f);
        Object.keys(chars).forEach(entityId => {
            const char = chars[entityId] as Char;

            this.graphics.strokeCircle(char.x, char.y, 1);
            this.graphics.strokeRectShape(char.getBounds());
        });
    }

    private drawReconciledPosition() {
        const error = this.controller.smooth.smooth.error;
        if (error) {
            this.graphics.lineStyle(2, 0xffe861);
            this.graphics.strokeRect(error.x - CHAR_SIZE / 2, error.y - CHAR_SIZE / 2, CHAR_SIZE, CHAR_SIZE);
        }
    }
}