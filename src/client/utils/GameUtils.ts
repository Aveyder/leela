import { Data } from "../resource/Data";
import { Scene } from "phaser";
import GameContext from "../GameContext";
import DataManager = Phaser.Data.DataManager;

interface RegistryHolder {
  registry: DataManager;
}

export default class GameUtils {
  public static getContext(registryHolder: RegistryHolder): GameContext {
    return registryHolder.registry.get(Data.CONTEXT) as GameContext;
  }
}
