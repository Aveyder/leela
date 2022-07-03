/* eslint-disable @typescript-eslint/no-var-requires */

import {Scene} from "phaser";
import {UNIT_SKINS} from "@leela/common";
import map from "../../../common/map/map.json";
import base from "../../../common/map/tilesets/base.png";
import grass from "../../../common/map/tilesets/grass.png";

import cursor from "../../public/assets/cursor.png";
import cursorHand from "../../public/assets/cursor-hand.png";
import cursorPlant from "../../public/assets/cursor-plant.png";
import cursorVendor from "../../public/assets/cursor-vendor.png";

import rpgItems from "../../public/assets/rpg-items.png";
import bag from "../../public/assets/bag.png";
import LoaderPlugin = Phaser.Loader.LoaderPlugin;
import AnimationManager = Phaser.Animations.AnimationManager;

export default class Preloader {

    private readonly load: LoaderPlugin;
    private readonly anims: AnimationManager;

    constructor(private scene: Scene) {
        this.load = scene.load;
        this.anims = scene.anims;
    }

    public preload(): void {
        this.loadSpritesheets();
        this.loadTiledMap();
        this.loadCursors();
        this.load.spritesheet("rpg-items", rpgItems, {frameWidth: 16, frameHeight: 16});
        this.load.image("bag", bag);

        this.load.on("complete", () => this.createAnims());
    }

    private loadSpritesheets() {
        this.loadUnits();
    }

    private loadUnits() {
        for(let i = 0; i < UNIT_SKINS; i++) {
            const unitUri = require(`../../public/assets/units/unit${i}.png`);
            this.load.spritesheet(`unit:${i}`, unitUri.default, {frameWidth: 32, frameHeight: 32});
        }
    }

    private loadTiledMap() {
        this.load.spritesheet("base", base, {frameWidth: 32, frameHeight: 32});
        this.load.image("grass", grass)
        this.load.tilemapTiledJSON("map", map);
    }

    private loadCursors() {
        this.load.image("cursor", cursor);
        this.load.image("cursor-hand", cursorHand);
        this.load.image("cursor-plant", cursorPlant);
        this.load.image("cursor-vendor", cursorVendor);
    }

    private createAnims() {
        this.createUnitAnims();
    }

    private createUnitAnims() {
        const config = {
            repeat: -1,
            frameRate: 8,
            yoyo: true
        };

        for(let i = 0; i < UNIT_SKINS; i++) {
            this.anims.create({
                key: `unit:${i}:walk:down`,
                frames: this.anims.generateFrameNumbers(`unit:${i}`, {start: 0, end: 2}),
                ...config
            });
            this.anims.create({
                key: `unit:${i}:walk:left`,
                frames: this.anims.generateFrameNames(`unit:${i}`, {start: 3, end: 5}),
                ...config
            });
            this.anims.create({
                key: `unit:${i}:walk:right`,
                frames: this.anims.generateFrameNames(`unit:${i}`, {start: 6, end: 8}),
                ...config
            });
            this.anims.create({
                key: `unit:${i}:walk:up`,
                frames: this.anims.generateFrameNames(`unit:${i}`, {start: 9, end: 11}),
                ...config
            });
        }
    }
}
