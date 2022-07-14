import WorldScene from "./WorldScene";
import Depth from "./Depth";
import GameObject, {canInteract} from "../core/GameObject";
import Unit, {hasRole} from "../core/Unit";
import Plant from "../plant/Plant";
import {Role, Type} from "@leela/common";
import {gatherPlant} from "../plant/gather";
import {Scene} from "phaser";
import POINTER_UP = Phaser.Input.Events.POINTER_UP;
import Pointer = Phaser.Input.Pointer;
import Image = Phaser.GameObjects.Image;


export default class Cursor extends Image {
    constructor(scene: Scene, x?: number, y?: number) {
        super(scene, x, y, "cursor");
    }

    public init() {
        const worldScene = this.scene as WorldScene;

        worldScene.input.setDefaultCursor(`none`);

        this.depth = Depth.CURSOR;

        worldScene.input.on(POINTER_UP, (pointer: Pointer, currentlyOver: GameObject[]) => {
            const gameObject = currentlyOver[0] as Unit | Plant;

            if (!gameObject) return;

            const player = worldScene.worldSession?.player;

            if (!player) return;

            if (canInteract(player, gameObject)) {
                if (gameObject.typeId == Type.PLANT) gatherPlant(player, gameObject as Plant);
            }
        });

        worldScene.add.existing(this);
    }

    public showPlant() {
        this.setTexture("cursor-plant");
    }

    public showVendor() {
        this.setTexture("cursor-vendor");
    }

    public showHand() {
        this.setTexture("cursor-hand");
    }

    public showArrow() {
        this.setTexture("cursor");
        this.setOrigin(0.25, 0);
    }

    public update()  {
        const worldScene = this.scene as WorldScene;

        const activePointer = worldScene.input.activePointer;

        this.alpha = 1;
        this.setPosition(activePointer.worldX, activePointer.worldY);

        const currentlyOver = worldScene.input.hitTestPointer(activePointer)[0] as unknown as Plant | Unit;

        this.setOrigin(0, 0);

        if (currentlyOver) {
            const player = worldScene.worldSession?.player;
            if (player && currentlyOver?.typeId != undefined) {
                this.alpha = canInteract(player, currentlyOver) ? 1 : 0.6;

                if (currentlyOver.typeId == Type.PLANT) {
                    this.showPlant();
                } else {
                    const unit = currentlyOver as Unit;

                    unit.nameText.visible = true;

                    if (hasRole(unit, Role.VENDOR)) {
                        this.showVendor();
                    } else {
                        this.showHand();
                    }
                }
            } else {
                this.showHand();
            }
        } else {
            this.showArrow();
        }
    }
}

