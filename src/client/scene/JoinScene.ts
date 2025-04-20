import { Model, MODELS } from "../../resource/Model";
import { Image } from "../../resource/Image";
import DOMElement = Phaser.GameObjects.DOMElement;
import WorldSession from "../WorldSession";
import Join from "../../entity/Join";
import { Opcode } from "../../protocol/Opcode";

export default class JoinScene extends Phaser.Scene {

  private currentModelIndex: number = 0;
  private nicknameInput: DOMElement;
  private modelImage: Phaser.GameObjects.Image;

  private session: WorldSession;

  constructor() {
    super('JoinScene');
  }

  init(data: { session: WorldSession }) {
    this.session = data.session;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    const modelY = height / 2 - 50;

    this.add.text(width / 2, modelY - 80, 'Choose Your Character', {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const leftArrow = this.add.text(width / 2 - 100, modelY, '<', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    leftArrow.on('pointerdown', () => {
      this.currentModelIndex = (this.currentModelIndex - 1 + MODELS.length) % MODELS.length;
      this.updateCurrentModel();
    });

    const rightArrow = this.add.text(width / 2 + 100, modelY, '>', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    rightArrow.on('pointerdown', () => {
      this.currentModelIndex = (this.currentModelIndex + 1) % MODELS.length;
      this.updateCurrentModel();
    });

    this.modelImage = this.add.image(width / 2, modelY, Image.PLACEHOLDER)
      .setScale(2)
      .setOrigin(0.5);
    this.updateCurrentModel();

    const nicknameY = modelY + 80;
    const nicknameInput = document.createElement('input');
    nicknameInput.type = 'text';
    nicknameInput.placeholder = 'Enter nickname';
    nicknameInput.style.width = '200px';
    nicknameInput.style.fontSize = '16px';
    nicknameInput.maxLength = 16;

    this.nicknameInput = this.add.dom(0, 0, nicknameInput);

    const container = this.add.container(width / 2, nicknameY);
    container.add([
      this.nicknameInput
    ]);

    const joinBtn = this.add.text(width / 2, nicknameY + 80, 'Join Game', {
      fontSize: '26px',
      backgroundColor: '#444',
      color: '#fff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    joinBtn.on('pointerdown', () => {
      const nickname = nicknameInput.value.trim();

      if (!nickname) return alert('Please enter a nickname.');

      this.session.sendObject<Join>(Opcode.MSG_JOIN, {
          model: MODELS[this.currentModelIndex],
          name: nickname
      });

      this.scene.stop();
    });
  }

  private updateCurrentModel() {
    const currentModel = MODELS[this.currentModelIndex];

    this.modelImage.setTexture(currentModel.imageKey);
    this.modelImage.setFrame(1);
  }
}
