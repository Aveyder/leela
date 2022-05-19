import "phaser";
import "../scss/styles.scss";
import NetworkSystem from "./network/NetworkSystem";
import WorldScene from "./game/world/WorldScene";
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
    const worldScene = game.scene.getScene("world") as WorldScene;

    worldScene.events.on(CREATE, () => {
        const network = new NetworkSystem();
        network.init();

        network.socket.on("connect", () => new Controller(network, game));
    });
});

game.scene.add("world", WorldScene, false);
game.scene.run("world");
