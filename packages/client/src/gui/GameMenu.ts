import Container = Phaser.GameObjects.Container;
import Graphics = Phaser.GameObjects.Graphics;
import Text = Phaser.GameObjects.Text;
import WorldScene from "../world/WorldScene";
import {GAME_HEIGHT, GAME_WIDTH} from "../config";
import Depth from "../world/Depth";
import {Opcode} from "@leela/common";

export default class GameMenu extends Container {

    private shadeGraphics: Graphics;
    private joinButton: Text;
    private disconnectedText: Text;

    constructor(scene: WorldScene) {
        super(scene);

        this.drawShade();
        this.drawJoinButton();
        this.drawDisconnectedText();
    }

    public showJoinMenu() {
        this.visible = true;

        this.joinButton.visible = true;
        this.disconnectedText.visible = false;
    }

    public showDisconnectedMenu() {
        this.visible = true;

        this.joinButton.visible = false;
        this.disconnectedText.visible = true;
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
            fontSize: "20px",
            fontFamily: "Arial",
            color: "#ffffff",
            backgroundColor: "#000000"
        })
            .setOrigin(0.5)
            .setPadding(10)
            .setInteractive()
            .on("pointerdown", () => {
                worldScene.worldSession.sendPacket([Opcode.MSG_JOIN]);
            });
        this.joinButton.visible = false;

        this.add(this.joinButton);
    }

    private drawDisconnectedText() {
        const worldScene = this.scene as WorldScene;

        this.disconnectedText = worldScene.add.text(worldScene.cameras.main.centerX, worldScene.cameras.main.centerY, "You've been disconnected",  {
            fontSize: "20px",
            fontFamily: "Arial",
            color: "#ffffff",
        })
            .setOrigin(0.5)
            .setPadding(10);
        this.disconnectedText.visible = false;

        this.add(this.disconnectedText);
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