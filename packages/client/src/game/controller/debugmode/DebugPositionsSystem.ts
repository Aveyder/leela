import {BODY_HEIGHT, BODY_WIDTH, Char as CharSnapshot, EntityType, Opcode, Snapshot, Vec2} from "@leela/common";
import Char from "../../world/view/Char";
import Controller from "../Controller";
import WorldScene from "../../world/WorldScene";
import DebugSystem from "./DebugSystem";
import {CLIENT_PREDICT} from "../../../constants/config";
import NetworkSystem from "../../../network/NetworkSystem";
import {POSITION} from "../../../constants/keys";
import Prediction from "../../../network/prediction/Prediction";
import Graphics = Phaser.GameObjects.Graphics;
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class DebugPositionsSystem {

    public showRemotePosition = true;
    public showPredictedPosition = true;
    public showReconciledPosition = true;
    public showLocalPosition = true;

    private readonly controller: Controller;
    private readonly worldScene: WorldScene;
    private readonly network: NetworkSystem;

    private graphics: Graphics;

    private snapshot: Snapshot;

    constructor(private readonly debug: DebugSystem) {
        this.controller = this.debug.controller;
        this.worldScene = this.controller.worldScene;
        this.network = this.controller.network;

        this.init();
    }

    private init() {
        this.graphics = this.worldScene.add.graphics();
        this.graphics.setDepth(1000);

        this.network.messages.on(Opcode.SMSG_SNAPSHOT, (snapshot: Snapshot) => {
            this.snapshot = snapshot;

            this.drawPositions();
        });

        this.worldScene.events.on(UPDATE, () => this.drawPositions());
    }

    private drawPositions() {
        this.graphics.clear();

        if (this.showRemotePosition) this.drawRemotePosition();
        if (this.showPredictedPosition) this.drawPredictedPosition();
        if (this.showReconciledPosition) this.drawReconciledPosition();
        if (this.showLocalPosition) this.drawLocalPosition();
    }

    private drawRemotePosition() {
        this.graphics.lineStyle(2, 0xcc00aa);

        const chars = this.controller.chars;

        this.snapshot?.forEach(entity => {
            if (entity.type == EntityType.CHAR) {
                const remoteChar = entity as CharSnapshot;
                this.graphics.strokeRect(remoteChar.x - BODY_WIDTH / 2, remoteChar.y - BODY_HEIGHT / 2, BODY_WIDTH, BODY_HEIGHT);

                const localChar = chars[entity.id];
                if (localChar) this.graphics.lineBetween(remoteChar.x, remoteChar.y, localChar.x, localChar.y);
            }
        });
    }

    private drawPredictedPosition() {
        const predicted = (this.network.predictions.map[POSITION] as Prediction<Vec2, Vec2>)?.predicted;
        const playerChar = this.controller.playerChar;

        if (CLIENT_PREDICT && playerChar && predicted) {
            this.graphics.lineStyle(2, 0xeed856);
            this.graphics.strokeRect(predicted.x - BODY_WIDTH / 2, predicted.y - BODY_HEIGHT / 2, BODY_WIDTH, BODY_HEIGHT);
            this.graphics.lineBetween(playerChar.x, playerChar.y, predicted.x, predicted.y);
        }
    }

    private drawReconciledPosition() {
        const reconciled = (this.network.predictions.map[POSITION] as Prediction<Vec2, Vec2>)?.reconciled;
        const playerChar = this.controller.playerChar;

        if (CLIENT_PREDICT && playerChar && reconciled) {
            this.graphics.lineStyle(2, 0x71dbff);
            this.graphics.strokeRect(reconciled.x - BODY_WIDTH / 2, reconciled.y - BODY_HEIGHT / 2, BODY_WIDTH, BODY_HEIGHT);
            this.graphics.lineBetween(playerChar.x, playerChar.y, reconciled.x, reconciled.y);
        }
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
}