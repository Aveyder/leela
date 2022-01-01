import "phaser";
import "../scss/styles.scss";
import NetworkSystem from "./network/NetworkSystem";
import GameScene from "./game/GameScene";
import {Game} from "phaser";
import {WORLD_HEIGHT, WORLD_WIDTH} from "@leela/common";
import Controller from "./game/Controller";
import READY = Phaser.Core.Events.READY;

const config = {
    backgroundColor: "#83957d",
    scale: {
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT
    }
};

const game = new Game(config);

game.scene.add("game", GameScene, false);
game.scene.run("game");

game.events.on(READY, () => {
    const network = new NetworkSystem();
    network.init();

    new Controller(network, game);
});
