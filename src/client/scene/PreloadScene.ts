import { ModelDescriptor, MODELS, ModelType } from "../../resource/Model";
import { Image } from "../../resource/Image";
import basePng from "../../assets/map/tilesets/base.png";
import grassPng from "../../assets/map/tilesets/grass.png";
import { Tilemap } from "../../resource/map/Tilemap";
import caltheraJson from "../../assets/map/calthera.json";
import { SPRITESHEETS } from "../../resource/Spritesheet";
import GameContext from "../GameContext";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
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
        this.scene.start('ConnectScene');
      }
    });

    this.doPreload();
  }

  private doPreload(): void {
    this.loadModels();
    this.loadTilemap();
    this.loadTextures();

    this.load.on("complete", () => this.createAnims());
  }

  private loadModels(): void {
    for(let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];

      if (model.type === ModelType.CHAR) {
        this.loadCharModel(model);
      }
    }
  }

  private loadCharModel(model: ModelDescriptor): void {
    const unitUri = require(`../../assets/model/${model.asset}`);
    this.load.spritesheet(model.imageKey, unitUri, {frameWidth: 32, frameHeight: 32});
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
    for(let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];

      if (model.type === ModelType.CHAR) {
        this.createCharAnim(model);
      }
    }
  }

  private createCharAnim(model: ModelDescriptor): void {
    const charAnimConfig = {
      repeat: -1,
      frameRate: 8,
      yoyo: true
    };

    this.anims.create({
      key: model.anim.down,
      frames: this.anims.generateFrameNumbers(model.imageKey, {start: 0, end: 2}),
      ...charAnimConfig
    });
    this.anims.create({
      key: model.anim.left,
      frames: this.anims.generateFrameNames(model.imageKey, {start: 3, end: 5}),
      ...charAnimConfig
    });
    this.anims.create({
      key: model.anim.right,
      frames: this.anims.generateFrameNames(model.imageKey, {start: 6, end: 8}),
      ...charAnimConfig
    });
    this.anims.create({
      key: model.anim.up,
      frames: this.anims.generateFrameNames(model.imageKey, {start: 9, end: 11}),
      ...charAnimConfig
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
