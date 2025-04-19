import { Data } from "../resource/Data";
import WorldClient from "../WorldClient";
import GameObjectManager from "../../core/GameObjectManager";
import DataManager = Phaser.Data.DataManager;

interface RegistryHolder {
  registry: DataManager;
}

export default class DataUtils {
  public static getWorldClient(registryHolder: RegistryHolder): WorldClient {
    return registryHolder.registry.get(Data.WORLD_CLIENT) as WorldClient;
  }

  public static getObjects(registryHolder: RegistryHolder): GameObjectManager {
    return registryHolder.registry.get(Data.OBJECTS) as GameObjectManager;
  }
}
