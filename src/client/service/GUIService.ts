import { GUI, GUIController } from "dat.gui";
import GameContext from "../GameContext";

export default class GUIService {

  private readonly context: GameContext;
  public readonly gui: GUI;

  private uptimeController: GUIController;
  private latencyController: GUIController;

  constructor(context: GameContext) {
    this.context = context;
    this.gui = new GUI();

    this.init();
  }

  public update(): void {
    if (this.context.session) {
      this.uptimeController.setValue(GUIService.hoursSince(this.context.session.serverStartTime));
      this.latencyController.setValue(this.context.session.latency);
    }
  }

  private init(): void {
    const revController = this.gui.add({
      rev: this.context.config.rev
    }, 'rev');
    this.uptimeController = this.gui.add({
      uptime: 'N/A'
    }, 'uptime').name('uptime');
    this.latencyController = this.gui.add({
      latency: 'N/A'
    }, 'latency').name('latency');

    GUIService.makeStatic(revController);
    GUIService.makeStatic(this.uptimeController);
    GUIService.makeStatic(this.latencyController);
  }

  private static hoursSince(timestamp: number) {
    const elapsedMs = Date.now() - timestamp;

    const totalMinutes = Math.floor(elapsedMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  public static makeStatic(controller: GUIController): void {
    controller.domElement.style.pointerEvents = 'none'
    controller.domElement.style.opacity = '0.7';
  }
}
