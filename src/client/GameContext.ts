import GameObjectManager from "../core/GameObjectManager";
import WorldClient from "./WorldClient";
import WorldSession from "./WorldSession";
import { Game } from "phaser";
import WorldScene from "./scene/WorldScene";
import { Data } from "./resource/Data";
import WorldClientConfig from "./WorldClientConfig";
import Events = Phaser.Core.Events;
import WorldSessionScope from "./WorldSessionScope";
import WorldSocket from "./WorldSocket";
import { Socket } from "socket.io-client";
import { TimeSync } from "timesync";
import DataManager = Phaser.Data.DataManager;

interface RegistryHolder {
  registry: DataManager;
}

export default class GameContext {
  public config!: WorldClientConfig;
  public client!: WorldClient;
  public io!: Socket | null;
  public socket!: WorldSocket;
  public ts!: TimeSync;
  public objects!: GameObjectManager;
  public game!: Game;
  public session!: WorldSession;
  public scene!: WorldScene;
  public scope!: WorldSessionScope;

  public init(game: Game): void {
    this.game = game;

    game.registry.set(Data.CONTEXT, this);

    game.events.on(Events.POST_STEP, (time: number, delta: number) => {
      this.objects.update(delta / 1000);
    });
  }

  public addSession(session: WorldSession): void {
    this.session = session;

    this.session.init();

    this.game.scene.start('WorldScene', {context: this});
  }

  public static get(registryHolder: RegistryHolder): GameContext {
    return registryHolder.registry.get(Data.CONTEXT) as GameContext;
  }
}
