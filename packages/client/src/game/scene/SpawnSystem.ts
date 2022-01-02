import {bound, SkinId, Vec2} from "@leela/common";
import Char from "./view/Char";
import GameScene from "./GameScene";
import GameObjectFactory = Phaser.GameObjects.GameObjectFactory;

export default class SpawnSystem {

    private readonly add: GameObjectFactory;

    constructor(private readonly gameScene: GameScene) {
        this.add = gameScene.add;
    }

    public char(skin: SkinId, x?: number, y?: number): Char {
        const char = new Char(this.gameScene, skin, x, y);

        bound(char);

        this.add.existing(char);

        return char;
    }
}
