import "phaser";
import "../scss/styles.scss";
import NetworkSystem from "./network/NetworkSystem";
import GameScene from "./game/GameScene";
import {Game} from "phaser";

const network = new NetworkSystem();
network.init();

const config = {
    backgroundColor: "#83957d",
    scale: {
        width: 800,
        height: 600
    }
}

const game = new Game(config);

game.scene.add("game", GameScene, false);
game.scene.run("game", network);
