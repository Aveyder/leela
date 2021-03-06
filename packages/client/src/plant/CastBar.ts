import Graphics = Phaser.GameObjects.Graphics;
import Text = Phaser.GameObjects.Text;
import Container = Phaser.GameObjects.Container;
import Tween = Phaser.Tweens.Tween;
import {Scene} from "phaser";
import {getPlayerState} from "../player/PlayerState";
import {TILE_SIZE} from "@leela/common";
import WorldScene from "../world/WorldScene";

enum CastBarStatus {
    IN_PROGRESS,
    FAIL,
    SUCCESS
}

export default class CastBar extends Container {

    private static readonly WIDTH = 90;
    private static readonly HEIGHT = 10;

    private readonly graphics: Graphics;
    private readonly text: Text;

    public totalTime: number;
    public currentTime: number;

    private _status: CastBarStatus;

    private hideTween: Tween;

    constructor(scene: Scene) {
        super(scene);

        this.graphics = new Graphics(this.scene);
        this.text = new Text(this.scene, 0, -1, "", {
            fontSize: "12px"
        });
        this.text.setOrigin(0.5, 0.5);

        this.add(this.graphics);
        this.add(this.text);

        this._status = CastBarStatus.IN_PROGRESS;
        this.update();
    }

    public show() {
        this.hideTween?.stop();
        this.visible = true;
        this.alpha = 1;
    }

    public hide() {
        this.hideTween = this.scene.add.tween({
            targets: this,
            alpha: 0,
            delay: 100,
            ease: "Sine.easeIn",
            duration: 250,
            onComplete: () => this.visible = false
        });
    }

    public set description(value: string) {
        this.text.text = value;
    }

    public set status(value: CastBarStatus) {
        this._status = value;

        this.update();
    }

    public get status() {
        return this._status;
    }
    
    public update() {
        this.graphics.clear();

        let borderColor;

        if (this._status == CastBarStatus.IN_PROGRESS) borderColor = 0x000000;
        if (this._status == CastBarStatus.FAIL) borderColor = 0xFFFFFF;
        if (this._status == CastBarStatus.SUCCESS) borderColor = 0xFFFFFF;

        this.graphics.lineStyle(3, borderColor);
        this.graphics.strokeRect(- CastBar.WIDTH / 2, - CastBar.HEIGHT / 2, CastBar.WIDTH, CastBar.HEIGHT);

        let backgroundColor;
        if (this._status == CastBarStatus.IN_PROGRESS) backgroundColor = 0x000000;
        if (this._status == CastBarStatus.FAIL) backgroundColor = 0xCC3E3E;
        if (this._status == CastBarStatus.SUCCESS) backgroundColor = 0x8FD94C;

        this.fillBackground(backgroundColor);

        if (this._status == CastBarStatus.IN_PROGRESS) {
            const progress = Math.min(this.currentTime / this.totalTime, 1);
            this.graphics.fillStyle(0xD97F4D);
            this.graphics.fillRect(
                -CastBar.WIDTH / 2, -CastBar.HEIGHT / 2,
                (CastBar.WIDTH) * progress, CastBar.HEIGHT
            )
            this.graphics.fillStyle(0xFFFFFF);
            this.graphics.fillRect((CastBar.WIDTH) * progress - 3 - CastBar.WIDTH / 2, -CastBar.HEIGHT / 2,
                3, CastBar.HEIGHT);
        }
    }

    private fillBackground(color: number) {
        this.graphics.fillStyle(color, 0.8);
        this.graphics.fillRect(
            - CastBar.WIDTH / 2, - CastBar.HEIGHT / 2,
            CastBar.WIDTH, CastBar.HEIGHT
        );
    }
}


function updateCastBar(worldScene: WorldScene, delta: number) {
    const player = worldScene.worldSession?.player;

    if (!player) return;

    const castBar = getPlayerState(player).castBar;

    castBar.setPosition(player.x, player.y + TILE_SIZE);

    castBar.currentTime += delta / 1000;
    castBar.update();
}

export {
    CastBarStatus,
    updateCastBar
}