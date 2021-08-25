import EventsMonitor from "./view/monitoring/EventsMonitor";
import UPDATE = Phaser.Scenes.Events.UPDATE;

export default class SandboxScene extends Phaser.Scene {

    constructor() {
        super("sandbox");
    }

    preload(): void {
    }

    create(): void {
        const monitor = new EventsMonitor(this, 50, 50);
        this.add.existing(monitor);

        monitor.label("snapshot", 0x00FF00);
        monitor.label("simulation", 0xFF0000);
        monitor.timerange = 1000;

        this.events.on(UPDATE, monitor.update, monitor);

        setInterval(() => {
            monitor.log("snapshot");
        }, 100);

        setInterval(() => {
            monitor.log("simulation");
        }, 200);
    }
}
