import GameObjectManager from "../core/GameObjectManager";
import WorldClient from "./WorldClient";
import WorldSession from "./WorldSession";
import { Game } from "phaser";
import WorldScene from "./scene/WorldScene";
import { Data } from "./resource/Data";
import WorldClientConfig from "./WorldClientConfig";
import Events = Phaser.Core.Events;
import WorldSessionScope from "./WorldSessionScope";

export default class GameContext {
  public config!: WorldClientConfig;
  public client!: WorldClient;
  public objects!: GameObjectManager;
  public game!: Game;
  public session!: WorldSession;
  public worldScene!: WorldScene;
  public scope!: WorldSessionScope;

  public init(game: Game): void {
    this.game = game;

    game.registry.set(Data.CONTEXT, this);

    game.events.on(Events.POST_STEP, (time: number, delta: number) => {
      this.objects.update(delta / 1000);
    });
  }

  public worldClientConnect(): void {
    this.client.connect(session => {
      this.session = session;
      session.init(this);

      this.game.scene.start('WorldScene', {context: this});
    });
  }
}
