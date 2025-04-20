import { Data } from "../resource/Data";
import WorldClient from "../WorldClient";
import GameObjectManager from "../../core/GameObjectManager";
import WorldSession from "../WorldSession";
import DataManager = Phaser.Data.DataManager;
import ScenePlugin = Phaser.Scenes.ScenePlugin;
import { Scene } from "phaser";

interface RegistryHolder {
  registry: DataManager;
}

export default class GameUtils {
  public static getWorldClient(registryHolder: RegistryHolder): WorldClient {
    return registryHolder.registry.get(Data.WORLD_CLIENT) as WorldClient;
  }

  public static getObjects(registryHolder: RegistryHolder): GameObjectManager {
    return registryHolder.registry.get(Data.OBJECTS) as GameObjectManager;
  }

  public static worldClientConnect(scene: Scene): void {
    const worldClient = GameUtils.getWorldClient(scene);

    worldClient.connect(session => {
      session.init(scene.game);
      scene.scene.start('WorldScene', {session});
    });
  }
}
