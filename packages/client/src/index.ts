import "phaser";
import "../scss/styles.scss";
import NetworkSystem from "./network/NetworkSystem";
import {deserializeSnapshot, WORLD_HEIGHT, WORLD_WIDTH} from "@leela/common";
import GameScene from "./game/GameScene";
import {Game} from "phaser";
import SandboxScene from "./game/SnadboxScene";

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
// game.scene.add("sandbox", SandboxScene, false);
// game.scene.run("sandbox");