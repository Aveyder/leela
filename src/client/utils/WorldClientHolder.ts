import { Scene } from "phaser";
import { Data } from "../resource/Data";
import WorldClient from "../WorldClient";

export default class WorldClientHolder {
  public static get(scene: Scene): WorldClient {
    return scene.registry.get(Data.WORLD_CLIENT) as WorldClient
  }
}
