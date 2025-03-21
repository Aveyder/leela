import { Game } from "phaser";
import "../assets/styles.css";
import WorldScene from "./world/WorldScene";

function main() {
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
    physics: {
      default: 'matter',
      matter: {
        debug: true
      }
    },
    scene: WorldScene
  });
}

main();
