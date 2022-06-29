import "phaser";
import "../public/styles.scss";
import WorldScene from "./world/WorldScene";
import {Game} from "phaser";
import {WORLD_HEIGHT, WORLD_WIDTH} from "@leela/common";


function boot() {
    new Game({
        backgroundColor: "#83957d",
        scale: {
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT
        },
        parent: document.querySelector(".game") as HTMLElement,
        scene: WorldScene
    });
}

boot();
