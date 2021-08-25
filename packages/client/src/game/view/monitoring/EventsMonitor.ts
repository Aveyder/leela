import Container = Phaser.GameObjects.Container;
import {Scene} from "phaser";
import Graphics = Phaser.GameObjects.Graphics;
import Text = Phaser.GameObjects.Text;
import TextStyle = Phaser.GameObjects.TextStyle;

type Color = number;

export default class EventsMonitor extends Container {

    private static readonly WIDTH = 700;
    private static readonly HEIGHT = 20;
    private static readonly LABEL_MARGIN = 5;
    private static readonly LABEL_SIZE = 10;

    private readonly labels: Record<string, Color>;
    private readonly text
    private readonly buffer: {label: string, time: number}[];
    private _timerange: number;
    private _broadth: number;

    private readonly graphics: Graphics;


    constructor(scene: Scene, x?: number, y?: number) {
        super(scene, x, y);

        this.labels = {};
        this._timerange = 10 * 1000;
        this.buffer = [];
        this._broadth = EventsMonitor.WIDTH;

        this.graphics = new Graphics(scene);

        this.add(this.graphics);

    }

    public update(time: number, delta: number): void {
        this.graphics.clear();

        this.graphics.fillStyle(0x000000, 0.75);
        this.graphics.fillRect(0, 0, this._broadth, EventsMonitor.HEIGHT);

        const now = Date.now();
        const start = now - this._timerange;

        let outdated = -1;
        for(let i = 0; i < this.buffer.length; i++) {
            const event = this.buffer[i];

            if (event.time >= start) {
                const color = this.labels[event.label];

                const pos = (event.time - start) / this._timerange * this._broadth;

                this.graphics.lineStyle(3, color, 0.75);
                this.graphics.lineBetween(pos, 0, pos, EventsMonitor.HEIGHT);
            } else {
                outdated++;
            }
        }

        if (outdated != -1) {
            this.buffer.splice(0, outdated + 1);
        }

        const labels = Object.keys(this.labels);

        this.graphics.fillStyle(0x000000, 0.85);
        this.graphics.fillRect(
            0, EventsMonitor.HEIGHT,
            this._broadth,
            EventsMonitor.LABEL_MARGIN + labels.length * (EventsMonitor.LABEL_SIZE + EventsMonitor.LABEL_MARGIN)
        );

        Object.keys(this.labels).forEach((label, i) => {
            const color = this.labels[label];
            this.graphics.fillStyle(color, 0.85);
            this.graphics.fillRect(
                EventsMonitor.LABEL_MARGIN,
                EventsMonitor.HEIGHT + EventsMonitor.LABEL_MARGIN + (EventsMonitor.LABEL_SIZE + EventsMonitor.LABEL_MARGIN) * i,
                EventsMonitor.LABEL_SIZE, EventsMonitor.LABEL_SIZE
            );

            const text = new Text(
                this.scene,
                EventsMonitor.LABEL_MARGIN * 2 + EventsMonitor.LABEL_SIZE,
                EventsMonitor.HEIGHT + (EventsMonitor.LABEL_SIZE + EventsMonitor.LABEL_MARGIN) * i + 1,
                label,
                {
                    fontSize: 15,
                    fontFamily: "Arial",
                    fontStyle: "normal"
                } as unknown as TextStyle
            );
            this.add(text);
        });
    }

    public label(name: string, color?: Color): void {
        if (color === undefined) {
            color = Math.random() * 0xFFFFFF;
        }

        this.labels[name] = color;
    }

    public log(label: string): void {
        const now = Date.now();

        this.buffer.push({
            time: now,
            label
        });
    }

    public set timerange(value: number) {
        this._timerange = value;
    }

    public get timerange(): number {
        return this._timerange;
    }

    public set broadth(value: number) {
        this._broadth = value;
    }

    public get broadth(): number {
        return this._broadth;
    }
}
