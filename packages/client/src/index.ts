import "phaser";
import "../public/styles.scss";
import WorldScene from "./world/WorldScene";
import {Game} from "phaser";
import {GAME_HEIGHT, GAME_WIDTH} from "./config";


function boot() {
    new Game({
        backgroundColor: "#83957d",
        scale: {
            width: GAME_WIDTH,
            height: GAME_HEIGHT
        },
        dom: {
            createContainer: true
        },
        parent: document.querySelector(".game") as HTMLElement,
        scene: WorldScene
    });
}

boot();
