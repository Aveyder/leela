import caltheraJson from "../../assets/map/calthera.json";
import basePng from "../../assets/map/tilesets/base.png";
import grassPng from "../../assets/map/tilesets/grass.png";
import { Tilemap } from "../../resource/map/Tilemap";
import WorldScene from "./WorldScene";
import { ModelDescriptor, MODELS, ModelType } from "../../resource/Model";
import { Image } from "../../resource/Image";
import LoaderPlugin = Phaser.Loader.LoaderPlugin;
import AnimationManager = Phaser.Animations.AnimationManager;
import { SPRITESHEETS } from "../../resource/Spritesheet";

export default class PreloadService {

  public readonly scene: WorldScene;
  public readonly load: LoaderPlugin;
  private readonly anims: AnimationManager;

  constructor(scene: WorldScene) {
    this.scene = scene;
    this.load = scene.load;
    this.anims = scene.anims;

    this.preload();
  }

  private preload(): void {
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
