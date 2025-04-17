import { Game } from "phaser";
import "../assets/styles.css";
import WorldScene from "./scene/WorldScene";
import WorldClient from "./WorldClient";
import WorldClientConfig from "./WorldClientConfig";
import { Data } from "./resource/Data";
import PreloadScene from "./scene/PreloadScene";
import ConnectScene from "./scene/ConnectScene";
import JoinScene from "./scene/JoinScene";

function main() {
  const worldClient = new WorldClient(WorldClientConfig.fromEnv());

  new Game({
    backgroundColor: "#83957d",
    scale: {
      width: process.env.GAME_WIDTH,
      height: process.env.GAME_HEIGHT
    },
    dom: {
      createContainer: true
    },
    parent: document.querySelector(".game") as HTMLElement,
    scene: [PreloadScene, ConnectScene, WorldScene, JoinScene],
    callbacks: {
      preBoot: game => {
        game.registry.set(Data.WORLD_CLIENT, worldClient);
      }
    }
  });
}

main();
