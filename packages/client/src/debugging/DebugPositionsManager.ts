import Graphics = Phaser.GameObjects.Graphics;
import UPDATE = Phaser.Scenes.Events.UPDATE;
import WorldScene from "../world/WorldScene";
import {Body, Vec2} from "@leela/common";
import {PlayerKey} from "../entities/PlayerKey";
import {CLIENT_PREDICT} from "../config";

export default class DebugPositionsManager {

    public showRemotePosition = true;
    public showInitialPosition = true;
    public showPredictedPosition = true;
    public showTargetPosition = true;
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
        if (this.showInitialPosition) this.drawInitialPosition();
        if (this.showPredictedPosition) this.drawPredictedPosition();
        if (this.showTargetPosition) this.drawTargetPosition();
        if (this.showReconciledPosition) this.drawReconciledPosition();
        if (this.showLocalPosition) this.drawLocalPosition();
    }

    private drawRemotePosition() {
        this.graphics.lineStyle(2, 0xcc00aa);

        const units = this.worldScene.units;

        Object.values(units).forEach(unit => {
            const body = unit.physBody;

            this.graphics.strokeRect(unit.remotePos.x - body.width / 2, unit.remotePos.y - body.height / 2, body.width, body.height);
            this.graphics.lineBetween(unit.remotePos.x, unit.remotePos.y, unit.x, unit.y);
        });
    }

    private drawInitialPosition() {
        const worldSession = this.worldScene.worldSession;

        if (!CLIENT_PREDICT || !worldSession?.player) return;

        const player = worldSession.player;

        const initial = player.getData(PlayerKey.PREDICTION_INITIAL_POS) as Vec2;

        this.graphics.lineStyle(2, 0x808080);
        this.graphics.strokeRect(initial.x - player.physBody.width / 2, initial.y - player.physBody.height / 2, player.physBody.width, player.physBody.height);
        this.graphics.lineBetween(player.x, player.y, initial.x, initial.y);
    }

    private drawPredictedPosition() {
        const worldSession = this.worldScene.worldSession;

        if (!CLIENT_PREDICT || !worldSession?.player) return;

        const player = worldSession.player;

        const predicted = player.getData(PlayerKey.PREDICTION_PREDICTED_BODY) as Body;

        this.graphics.lineStyle(2, 0xeed856);
        this.graphics.strokeRect(predicted.x - predicted.width / 2, predicted.y - predicted.height / 2, predicted.width, predicted.height);
        this.graphics.lineBetween(player.x, player.y, predicted.x, predicted.y);
    }

    private drawTargetPosition() {
        const worldSession = this.worldScene.worldSession;

        if (!CLIENT_PREDICT || !worldSession?.player) return;

        const player = worldSession.player;

        const target = player.getData(PlayerKey.PREDICTION_TARGET_POS) as Vec2;

        this.graphics.lineStyle(2, 0x2b3eb4);
        this.graphics.strokeRect(target.x - player.physBody.width / 2, target.y - player.physBody.height / 2, player.physBody.width, player.physBody.height);
        this.graphics.lineBetween(player.x, player.y, target.x, target.y);
    }

    private drawReconciledPosition() {
        const worldSession = this.worldScene.worldSession;

        if (!CLIENT_PREDICT || !worldSession?.player) return;

        const player = worldSession.player;

        const reconciled = player.getData(PlayerKey.PREDICTION_RECONCILED_BODY) as Body;

        this.graphics.lineStyle(2, 0x71dbff);
        this.graphics.strokeRect(reconciled.x - reconciled.width / 2, reconciled.y - reconciled.height / 2, reconciled.width, reconciled.height);
        this.graphics.lineBetween(player.x, player.y, reconciled.x, reconciled.y);
    }

    private drawLocalPosition() {
        const units = this.worldScene.units;

        this.graphics.lineStyle(2, 0x87e56f);
        Object.values(units).forEach(unit => {
            const body = unit.physBody;

            this.graphics.strokeCircle(unit.x, unit.y, 1);
            this.graphics.strokeRect(unit.x - body.width / 2, unit.y - body.height / 2, body.width, body.height);
        });
    }
}