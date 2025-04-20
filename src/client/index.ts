import { Game } from "phaser";
import "../assets/styles.css";
import WorldScene from "./scene/WorldScene";
import WorldClient from "./WorldClient";
import WorldClientConfig from "./WorldClientConfig";
import PreloadScene from "./scene/PreloadScene";
import ConnectScene from "./scene/ConnectScene";
import JoinScene from "./scene/JoinScene";
import GameObjectManager from "../core/GameObjectManager";
import GameContext from "./GameContext";

function main() {
  const context = new GameContext();

  context.config = WorldClientConfig.fromEnv();
  context.client = new WorldClient(context);
  context.objects = new GameObjectManager();

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
      preBoot: game => context.init(game)
    }
  });
}

main();
