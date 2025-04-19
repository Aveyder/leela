import WorldSession from "../WorldSession";
import DataUtils from "../utils/DataUtils";

export default class ConnectScene extends Phaser.Scene {
  constructor() {
    super('ConnectScene');
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const connectText = this.add.text(centerX, centerY, 'Connect', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    connectText.on('pointerdown', async () => {
      connectText.setText('Connecting...');
      connectText.disableInteractive();

      DataUtils.getWorldClient(this).connect((session: WorldSession) => {
        this.scene.start('WorldScene', { session });
      });
    });
  }
}
