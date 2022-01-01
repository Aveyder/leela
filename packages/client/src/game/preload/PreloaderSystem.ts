/* eslint-disable @typescript-eslint/no-var-requires */

import {Scene} from "phaser";
import {CHAR_SKINS} from "@leela/common";
import LoaderPlugin = Phaser.Loader.LoaderPlugin;
import AnimationManager = Phaser.Animations.AnimationManager;

export default class PreloaderSystem {

    private readonly load: LoaderPlugin;
    private readonly anims: AnimationManager;

    constructor(private scene: Scene) {
        this.load = scene.load;
        this.anims = scene.anims;
    }

    public preload(): void {
        this.loadSpritesheets();

        this.load.on("complete", () => this.createAnims());
    }

    private loadSpritesheets() {
        this.loadChars();
    }

    private loadChars() {
        for(let i = 0; i < CHAR_SKINS; i++) {
            const charUri = require(`../../../public/assets/chars/char${i}.png`);
            this.load.spritesheet(`char:${i}`, charUri.default, {frameWidth: 32, frameHeight: 32});
        }
    }

    private createAnims() {
        this.createCharAnims();
    }

    private createCharAnims() {
        const config = {
            repeat: -1,
            frameRate: 8,
            yoyo: true
        };

        for(let i = 0; i < CHAR_SKINS; i++) {
            this.anims.create({
                key: `char:${i}:walk:down`,
                frames: this.anims.generateFrameNumbers(`char:${i}`, {start: 0, end: 2}),
                ...config
            });
            this.anims.create({
                key: `char:${i}:walk:left`,
                frames: this.anims.generateFrameNames(`char:${i}`, {start: 3, end: 5}),
                ...config
            });
            this.anims.create({
                key: `char:${i}:walk:right`,
                frames: this.anims.generateFrameNames(`char:${i}`, {start: 6, end: 8}),
                ...config
            });
            this.anims.create({
                key: `char:${i}:walk:up`,
                frames: this.anims.generateFrameNames(`char:${i}`, {start: 9, end: 11}),
                ...config
            });
        }
    }
}
