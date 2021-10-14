import "phaser";
import "../scss/styles.scss";
import NetworkSystem from "./network/NetworkSystem";
import {WORLD_HEIGHT, WORLD_WIDTH} from "@leela/common";
import GameScene from "./game/GameScene";
import {Game} from "phaser";

const network = new NetworkSystem();
network.init();

const config = {
    backgroundColor: "#83957d",
    scale: {
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT
    }
}

const game = new Game(config);

game.scene.add("game", GameScene, false);
game.scene.run("game", network);
