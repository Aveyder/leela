import Container = Phaser.GameObjects.Container;
import Graphics = Phaser.GameObjects.Graphics;
import Text = Phaser.GameObjects.Text;
import WorldScene from "../world/WorldScene";
import {GAME_HEIGHT, GAME_WIDTH} from "../config";
import Depth from "../world/Depth";
import {Opcode} from "@leela/common";
import {join} from "../player/join";

export default class GameMenu extends Container {

    private shadeGraphics: Graphics;
    private joinButton: Text;
    private connectButton: Text;
    private disconnectButton: Text;
    private disconnectedText: Text;
    private leaveButton: Text;

    constructor(scene: WorldScene) {
        super(scene);

        this.drawShade();
        this.drawJoinButton();
        this.drawConnectButton();
        this.drawDisconnectButton();
        this.drawDisconnectedText();
        this.drawLeaveButton();
    }

    public showJoinMenu() {
        this.shadeGraphics.visible = true;
        this.joinButton.visible = true;
        this.connectButton.visible = false;
        this.disconnectButton.visible = true;
        this.disconnectedText.visible = false;
        this.leaveButton.visible = false;
    }

    public showDisconnectedMenu() {
        this.shadeGraphics.visible = true;
        this.joinButton.visible = false;
        this.connectButton.visible = true;
        this.disconnectButton.visible = false;
        this.disconnectedText.visible = true;
        this.leaveButton.visible = false;
    }

    public showInGameMenu() {
        this.shadeGraphics.visible = false;
        this.joinButton.visible = false;
        this.connectButton.visible = false;
        this.disconnectButton.visible = false;
        this.disconnectedText.visible = false;
        this.leaveButton.visible = true;
    }

    private drawShade() {
        this.shadeGraphics = this.scene.add.graphics(this);
        this.shadeGraphics.fillStyle(0x000, 0.65);
        this.shadeGraphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.add(this.shadeGraphics);
    }

    private drawJoinButton() {
        const worldScene = this.scene as WorldScene;

        this.joinButton = worldScene.add.text(worldScene.cameras.main.centerX, worldScene.cameras.main.centerY, "Join Game",  {
            fontSize: "12px",
            fontFamily: "Arial",
            color: "#ffffff",
            backgroundColor: "#000000"
        })
            .setOrigin(0.5, 0.5)
            .setPadding(10)
            .setInteractive()
            .on("pointerdown", () => {
                join(worldScene.worldSession);
            });

        this.add(this.joinButton);
    }

    private drawConnectButton() {
        const worldScene = this.scene as WorldScene;

        this.connectButton = worldScene.add.text(worldScene.cameras.main.centerX, worldScene.cameras.main.centerY + 30, "connect",  {
            fontSize: "12px",
            fontFamily: "Arial",
            color: "#ffffff",
            backgroundColor: "#000000"
        })
            .setOrigin(0.5, 0.5)
            .setPadding(10)
            .setInteractive()
            .on("pointerdown", () => {
                worldScene.worldClient.connect();
            });

        this.add(this.connectButton);
    }

    private drawDisconnectButton() {
        const worldScene = this.scene as WorldScene;

        this.disconnectButton = worldScene.add.text(worldScene.cameras.main.centerX, 0, "disconnect",  {
            fontSize: "12px",
            fontFamily: "Arial",
            color: "#ffffff",
            backgroundColor: "#000000"
        })
            .setOrigin(0.5, 0.5)
            .setPadding(5)
            .setInteractive()
            .on("pointerdown", () => {
                worldScene.worldClient.disconnect();
            });

        this.disconnectButton.y = GAME_HEIGHT - this.disconnectButton.height / 2;

        this.add(this.disconnectButton);
    }

    private drawDisconnectedText() {
        const worldScene = this.scene as WorldScene;

        this.disconnectedText = worldScene.add.text(worldScene.cameras.main.centerX, worldScene.cameras.main.centerY, "you are disconnected",  {
            fontSize: "12px",
            fontFamily: "Arial",
            color: "#ffffff",
        })
            .setOrigin(0.5)
            .setPadding(10);

        this.add(this.disconnectedText);
    }

    private drawLeaveButton() {
        const worldScene = this.scene as WorldScene;

        this.leaveButton = worldScene.add.text(0, 0, "leave",  {
            fontSize: "12px",
            fontFamily: "Arial",
            color: "#ffffff",
            backgroundColor: "rgba(0,0,0,0.5)"
        })
            .setPadding(5)
            .setOrigin(0, 0.5)
            .setInteractive()
            .on("pointerdown", () => {
                worldScene.worldSession?.sendPacket([Opcode.CMSG_LEAVE]);
            });

        this.leaveButton.x = GAME_WIDTH - this.leaveButton.width - 10;
        this.leaveButton.y = this.leaveButton.height / 2;

        this.add(this.leaveButton);
    }
}

function initGameMenu(worldScene: WorldScene) {
    const gameMenu = new GameMenu(worldScene);
    gameMenu.showDisconnectedMenu();
    gameMenu.depth = Depth.MENU;

    worldScene.add.existing(gameMenu);

    return gameMenu;
}

export {
    initGameMenu
}