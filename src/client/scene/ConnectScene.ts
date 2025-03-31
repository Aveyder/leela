import { Data } from "../resource/Data";
import WorldClient from "../WorldClient";
import WorldSession from "../WorldSession";

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

      const worldClient = this.registry.get(Data.WORLD_CLIENT) as WorldClient;

      worldClient.connect((session: WorldSession) => {
        this.scene.start('WorldScene', { session });
      });

      // try {
      //   const worldClient = getWorldClient();
      //   const session = await worldClient.connect();
      //
      //   // Transition to GameScene, passing the session
      //   this.scene.start('GameScene', { session });
      //
      // } catch (err) {
      //   console.error('Connection failed:', err);
      //   connectText.setText('Connect Failed (Retry)');
      //   connectText.setInteractive();
      // }
    });
  }
}
