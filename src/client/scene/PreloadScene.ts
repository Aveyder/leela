import { ModelDescriptor, MODELS, ModelType } from "../../resource/Model";
import { Image } from "../../resource/Image";
import basePng from "../../assets/map/tilesets/base.png";
import grassPng from "../../assets/map/tilesets/grass.png";
import { Tilemap } from "../../resource/map/Tilemap";
import caltheraJson from "../../assets/map/calthera.json";
import { SPRITESHEETS } from "../../resource/Spritesheet";
import GameContext from "../GameContext";
import ConnectScene from "./ConnectScene";
import { CHAR_ANIMS } from "../../resource/Anim";
import AnimationFrame = Phaser.Types.Animations.AnimationFrame;

export default class PreloadScene extends Phaser.Scene {

  public static readonly KEY = 'PreloadScene';

  constructor() {
    super(PreloadScene.KEY);
  }

  preload() {
    const width = this.scale.width;
    const height = this.scale.height;

    const progressBox = this.add.rectangle(width / 2, height / 2, 304, 34, 0x222222);
    const progressBar = this.add.rectangle(width / 2 - 150, height / 2, 0, 30, 0xffffff).setOrigin(0, 0.5);

    const loadingText = this.add.text(width / 2, height / 2 - 35, 'Loading...', {
      fontSize: '16px',
      color: '#000000'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.width = 300 * value;
    });

    const context = GameContext.get(this);

    this.load.on('complete', () => {
      if (context.config.debugMode) {
        context.client.connect();
      } else {
        this.scene.start(ConnectScene.KEY);
      }
    });

    this.doPreload();
  }

  private doPreload(): void {
    this.loadTilemap();
    this.loadTextures();

    this.load.on("complete", () => this.createAnims());
  }

  private loadCharModel(model: ModelDescriptor): void {
    const unitUri = require(`../../assets/model/${model.assetPrefix}`);
    this.load.atlas(model.imageKey, unitUri, {frameWidth: 32, frameHeight: 32});
  }

  private loadTilemap(): void {
    this.load.spritesheet(Image.TILESET_BASE, basePng, {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet(Image.TILESET_GRASS, grassPng, {frameWidth: 32, frameHeight: 32});
    this.load.tilemapTiledJSON(Tilemap.CALTHERA.jsonKey, caltheraJson);
  }

  private loadTextures(): void {
    this.load.image(Image.PLACEHOLDER, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==')
    this.loadSpritesheets();
  }

  private createAnims(): void {
    this.createModelAnims();
  }

  private createModelAnims(): void {
    MODELS.filter(model => model.type === ModelType.CHAR)
      .forEach(model => this.createCharAnim(model));
  }

  private createCharAnim(model: ModelDescriptor): void {
    Object.keys(model.anim).forEach(animKey => {
      const anim = CHAR_ANIMS[animKey];

      this.anims.create({
        key: `${model.assetPrefix}:${animKey}`,
        frames: this.anims.generateFrameNames(model.imageKey, { prefix: model.assetPrefix, ...anim.frameNumbers, suffix: '.png'}) as AnimationFrame[],
        ...anim.config
      });
    });
  }

  private loadSpritesheets(): void {
    for (let i = 0; i < SPRITESHEETS.length; i++) {
      const sprite = SPRITESHEETS[i];
      this.load.atlas(
        sprite.imageKey,
        require(`../../assets/sprites/${sprite.assetImage}`),
        require(`../../assets/sprites/${sprite.assetJSON}?url`),
      );
    }
  }
}
