import { Game } from "phaser";
import "../assets/styles.css";
import WorldScene from "./scene/WorldScene";
import WorldClient from "./WorldClient";
import WorldClientConfig from "./WorldClientConfig";
import { Data } from "./resource/Data";
import PreloadScene from "./scene/PreloadScene";
import ConnectScene from "./scene/ConnectScene";
import JoinScene from "./scene/JoinScene";
import Events = Phaser.Core.Events;
import GameObjectManager from "../core/GameObjectManager";

function main() {
  const worldClient = new WorldClient(WorldClientConfig.fromEnv());
  const objects = new GameObjectManager();

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
        game.registry.set(Data.OBJECTS, objects);

        game.events.on(Events.POST_STEP, (time: number, delta: number) => {
          objects.update(delta / 1000);
        });
      }
    }
  });
}

main();
