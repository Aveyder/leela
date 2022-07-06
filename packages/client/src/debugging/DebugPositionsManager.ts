import Graphics = Phaser.GameObjects.Graphics;
import WorldScene from "../world/WorldScene";
import {CLIENT_PREDICT} from "../config";
import {getPlayerState} from "../player/PlayerState";
import Depth from "../world/Depth";


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
        this.graphics.depth = Depth.DEBUG;
    }

    public update() {
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

            const pos = unit.snapshots[unit.snapshots.length - 1]?.state;

            if (!pos) return;

            this.graphics.strokeRect(pos.x - body.width / 2, pos.y - body.height / 2, body.width, body.height);
            this.graphics.lineBetween(pos.x, pos.y, unit.x, unit.y);
        });
    }

    private drawInitialPosition() {
        const worldSession = this.worldScene.worldSession;

        if (!CLIENT_PREDICT || !worldSession?.player) return;

        const player = worldSession.player;
        const initialPos = getPlayerState(player).initialPos;

        this.graphics.lineStyle(2, 0x808080);
        this.graphics.strokeRect(initialPos.x - player.physBody.width / 2, initialPos.y - player.physBody.height / 2, player.physBody.width, player.physBody.height);
        this.graphics.lineBetween(player.x, player.y, initialPos.x, initialPos.y);
    }

    private drawPredictedPosition() {
        const worldSession = this.worldScene.worldSession;

        if (!CLIENT_PREDICT || !worldSession?.player) return;

        const player = worldSession.player;
        const predictedBody = getPlayerState(player).predictedBody;

        this.graphics.lineStyle(2, 0xeed856);
        this.graphics.strokeRect(predictedBody.x - predictedBody.width / 2, predictedBody.y - predictedBody.height / 2, predictedBody.width, predictedBody.height);
        this.graphics.lineBetween(player.x, player.y, predictedBody.x, predictedBody.y);
    }

    private drawTargetPosition() {
        const worldSession = this.worldScene.worldSession;

        if (!CLIENT_PREDICT || !worldSession?.player) return;

        const player = worldSession.player;
        const targetPos = getPlayerState(player).targetPos;

        this.graphics.lineStyle(2, 0x2b3eb4);
        this.graphics.strokeRect(targetPos.x - player.physBody.width / 2, targetPos.y - player.physBody.height / 2, player.physBody.width, player.physBody.height);
        this.graphics.lineBetween(player.x, player.y, targetPos.x, targetPos.y);
    }

    private drawReconciledPosition() {
        const worldSession = this.worldScene.worldSession;

        if (!CLIENT_PREDICT || !worldSession?.player) return;

        const player = worldSession.player;
        const reconciledBody = getPlayerState(player).reconciledBody;

        this.graphics.lineStyle(2, 0x71dbff);
        this.graphics.strokeRect(reconciledBody.x - reconciledBody.width / 2, reconciledBody.y - reconciledBody.height / 2, reconciledBody.width, reconciledBody.height);
        this.graphics.lineBetween(player.x, player.y, reconciledBody.x, reconciledBody.y);
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

    public destroy() {
        this.graphics.destroy();
    }
}