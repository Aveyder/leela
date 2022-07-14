import Key = Phaser.Input.Keyboard.Key;
import WorldScene from "./WorldScene";
import {switchWalkMode} from "../player/movement";

type Keys = {
    W: Key,
    A: Key,
    S: Key,
    D: Key,
    up: Key,
    left: Key,
    down: Key,
    right: Key,
    Z: Key
};

function initKeys(worldScene: WorldScene) {
    const keys = worldScene.input.keyboard.addKeys("W,A,S,D,up,left,down,right,Z", false) as Keys;

    keys.Z.on("up", () => switchWalkMode(worldScene.worldSession));

    return keys;
}

export {
    Keys,
    initKeys
}