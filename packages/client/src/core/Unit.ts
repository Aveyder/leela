import Sprite = Phaser.GameObjects.Sprite;
import Text = Phaser.GameObjects.Text;
import {Scene} from "phaser";
import {Role, UNIT_BODY_HEIGHT, UNIT_BODY_WIDTH} from "@leela/common";
import PhysBody from "../physics/PhysBody";
import WorldScene from "../world/WorldScene";
import Depth from "../world/Depth";
import {appear, hideAndDestroy} from "./GameObject";
import {UnitUpdate} from "./update";
import {getNpcState} from "../npc/NpcState";


type Snapshot = {
    state: UnitUpdate,
    timestamp: number
}

export default class Unit extends Sprite {

    public guid: number;
    public typeId: number;
    private _skin: number;
    public readonly snapshots: Snapshot[];
    public readonly physBody: PhysBody;
    private _nameText: Text;

    constructor(scene: Scene, skin = 0, x?: number, y?: number) {
        super(scene, x, y, `unit:${skin}`);

        this._skin = skin;

        this.physBody = new PhysBody(this);
        this.physBody.width = UNIT_BODY_WIDTH;
        this.physBody.height = UNIT_BODY_HEIGHT;

        this.setDir(0, 0);

        this.skin = skin;

        this.snapshots = [];

        this.createNameText();
    }

    private createNameText() {
        this._nameText = this.scene.add.text(0, 0, "", {
            fontSize: "12px",
            fontFamily: "Arial",
            color: "#ffffff",
            backgroundColor: "#000000"
        }).setOrigin(0.5, 0.5)
    }

    public get nameText() {
        return this._nameText;
    }

    public set skin(value: number) {
        this._skin = value;
        this.setTexture(`unit:${this._skin}`);
        this.updateDir();
    }

    public setDir(vx: number, vy: number) {
        this.physBody.vx = vx;
        this.physBody.vy = vy;

        this.updateDir();
    }

    private updateDir() {
        if (this.physBody.vx == 0 && this.physBody.vy == 0) {
            this.stay();
        } else {
            this.walk();
        }
    }

    private stay() {
        this.anims.pause();
        this.setFrame(1);
    }

    private walk() {
        const dir = this.getDirection(this.physBody.vx, this.physBody.vy);

        const anim = `unit:${this._skin}:walk:${dir}`;
        if (this.anims.currentAnim?.key == anim) {
            this.anims.resume(this.anims.currentFrame);
        } else {
            this.play(anim);
        }
    }

    private getDirection(vx: number, vy: number) {
        let dir;

        if (Math.abs(vy)/Math.abs(vx) >= 0.9) {
            if (vy > 0) {
                dir = "down";
            }
            if (vy < 0) {
                dir = "up";
            }
        } else {
            if (vx > 0) {
                dir = "right";
            }
            if (vx < 0) {
                dir = "left";
            }
        }

        return dir;
    }

    public update() {
        this.depth = this._nameText.depth = Depth.UNIT + this.y / 1000000;

        this._nameText.x = this.x;
        this._nameText.y = this.y - UNIT_BODY_HEIGHT / 2 - this._nameText.height;

        this._nameText.visible = false;
    }

    public destroy(fromScene?: boolean) {
        this._nameText.destroy(fromScene);
        super.destroy(fromScene);
    }
}

function addUnitToWorld(unit: Unit) {
    const worldScene = unit.scene as WorldScene;

    worldScene.add.existing(unit);

    unit.depth = Depth.UNIT;

    const guid = unit.guid;

    worldScene.units[guid] = unit;

    appear(unit);
}

function deleteUnitFromWorld(unit: Unit) {
    const worldScene = unit.scene as WorldScene;

    hideAndDestroy(unit);

    delete worldScene.units[unit.guid];
}

function isPlayer(unit: Unit) {
    const worldSession = (unit.scene as WorldScene).worldSession;

    return worldSession.playerGuid == unit.guid;
}

function hasRole(unit: Unit, role: Role) {
    const npcState = getNpcState(unit);

    return npcState?.roles && npcState.roles.findIndex(r => r == role) != -1;
}

export {
    Snapshot,
    addUnitToWorld,
    deleteUnitFromWorld,
    isPlayer,
    hasRole
}
