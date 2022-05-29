import "phaser";
import "../scss/styles.scss";
import NetworkSystem from "./network/NetworkSystem";
import WorldScene from "./game/world/WorldScene";
import {Game} from "phaser";
import {SerdeSystem, WORLD_HEIGHT, WORLD_WIDTH} from "@leela/common";
import Controller from "./game/controller/Controller";
import {init as initSerde} from "./game/controller/serde";
import GAME_READY = Phaser.Core.Events.READY;
import CREATE = Phaser.Scenes.Events.CREATE;
import SandboxScene from "./game/world/SandboxScene";

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
        const serde = new SerdeSystem();
        initSerde(serde);

        const network = new NetworkSystem(serde);
        network.init();

        network.socket.on("connect", () => new Controller(network, game));
    });
});

game.scene.add("world", WorldScene, false);
// game.scene.run("world");

game.scene.add("sandbox", SandboxScene, true);