import {bound, SkinId} from "@leela/common";
import Char from "./view/Char";
import WorldScene from "./WorldScene";
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;

export default class SpawnSystem {

    private readonly add: GameObjectFactory;

    constructor(private readonly worldScene: WorldScene) {
        this.add = worldScene.add;
    }

    public char(skin: SkinId, x?: number, y?: number): Char {
        const char = new Char(this.worldScene, skin, x, y);

        bound(char);

        this.add.existing(char);

        return char;
    }
}
