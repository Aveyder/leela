import Graphics = Phaser.GameObjects.Graphics;
import UPDATE = Phaser.Scenes.Events.UPDATE;
import WorldScene from "../world/WorldScene";
import {BODY_HEIGHT, BODY_WIDTH, Vec2} from "@leela/common";
import {PlayerKey} from "../entities/PlayerKey";
import {CLIENT_PREDICT} from "../config";

export default class DebugPositionsManager {

    public showRemotePosition = true;
    public showPredictedPosition = true;
    public showReconciledPosition = true;
    public showLocalPosition = true;

    private readonly worldScene: WorldScene;

    private graphics: Graphics;

    constructor(worldScene: WorldScene) {
        this.worldScene = worldScene;
    }

    public init(): void {
        this.graphics = this.worldScene.add.graphics();
        this.graphics.setDepth(999);

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

        const units = this.worldScene.units;

        Object.values(units).forEach(unit => {
            this.graphics.strokeRect(unit.remotePos.x - BODY_WIDTH / 2, unit.remotePos.y - BODY_HEIGHT / 2, BODY_WIDTH, BODY_HEIGHT);
            this.graphics.lineBetween(unit.remotePos.x, unit.remotePos.y, unit.x, unit.y);
        });
    }

    private drawPredictedPosition() {
        if (!CLIENT_PREDICT) return;

        const worldSession = this.worldScene.worldSession;

        if (!worldSession) return;

        const player = worldSession.player;

        if (!player) return;

        const predicted = player.getData(PlayerKey.PREDICTION_PREDICTED_POS) as Vec2;

        if (predicted) {
            this.graphics.lineStyle(2, 0xeed856);
            this.graphics.strokeRect(predicted.x - BODY_WIDTH / 2, predicted.y - BODY_HEIGHT / 2, BODY_WIDTH, BODY_HEIGHT);
            this.graphics.lineBetween(player.x, player.y, predicted.x, predicted.y);
        }
    }

    private drawReconciledPosition() {
        if (!CLIENT_PREDICT) return;

        const worldSession = this.worldScene.worldSession;

        if (!worldSession) return;

        const player = worldSession.player;

        if (!player) return;

        const reconciled = player.getData(PlayerKey.PREDICTION_RECONCILED_POS) as Vec2;

        if (reconciled) {
            this.graphics.lineStyle(2, 0x71dbff);
            this.graphics.strokeRect(reconciled.x - BODY_WIDTH / 2, reconciled.y - BODY_HEIGHT / 2, BODY_WIDTH, BODY_HEIGHT);
            this.graphics.lineBetween(player.x, player.y, reconciled.x, reconciled.y);
        }
    }

    private drawLocalPosition() {
        const units = this.worldScene.units;

        this.graphics.lineStyle(2, 0x87e56f);
        Object.values(units).forEach(unit => {
            this.graphics.strokeCircle(unit.x, unit.y, 1);
            this.graphics.strokeRectShape(unit.getBounds());
        });
    }
}