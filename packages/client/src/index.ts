import "phaser";
import "../scss/styles.scss";
import NetworkSystem from "./network/NetworkSystem";
import GameScene from "./game/scene/GameScene";
import {Game} from "phaser";
import {WORLD_HEIGHT, WORLD_WIDTH} from "@leela/common";
import Controller from "./game/controller/Controller";
import GAME_READY = Phaser.Core.Events.READY;
import CREATE = Phaser.Scenes.Events.CREATE;

const config = {
    backgroundColor: "#83957d",
    scale: {
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT
    }
};

const game = new Game(config);

game.events.on(GAME_READY, () => {
    const gameScene = game.scene.getScene("game") as GameScene;

    gameScene.events.on(CREATE, () => {
        const network = new NetworkSystem();
        network.init();

        new Controller(network, game);
    });
});

game.scene.add("game", GameScene, false);
game.scene.run("game");
