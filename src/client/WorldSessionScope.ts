import WorldScene from "./world/WorldScene";
import WorldSession from "./WorldSession";
import Player from "./core/Player";
import ControlComponent from "./core/ControlComponent";
import GameObjectState from "../entity/GameObjectState";
import { ComponentId } from "../protocol/ComponentId";
import { ModelDescriptor } from "../resource/Model";
import ModelComponent from "./core/ModelComponent";

export default class WorldSessionScope {
  public readonly session: WorldSession;
  public readonly scene: WorldScene;

  public playerGuid: number;
  public player: Player | null;

  constructor(session: WorldSession) {
    this.session = session;
    this.scene = session.scene!;

    this.playerGuid = -1;
    this.player = null;
  }

  public simulate(delta: number) {
    this.player?.getComponent(ControlComponent).applyControl();
  }

  public destroy(): void {
    this.scene.objects.destroy();

    this.player = null;
  }
}
