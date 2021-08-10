type ClearInterval = (handle: unknown) => void;
type Performance = { now: () => number };
type Context = {
    clearInterval: ClearInterval,
    performance: Performance
};

export default class Loop {

    private _tickrate: number;
    private interval: number;

    private time: number;
    private timer: unknown;

    private static clearInterval: ClearInterval;
    private static performance: Performance;

    constructor(
        private readonly callback: (delta: number) => void,
        tickrate: number
    ) {
        this.tickrate = tickrate;
    }

    public start(): void {
        this.time = Loop.performance.now();
        this.timer = setInterval(() => this.tick(), this.interval);
    }

    private tick() {
        const now = Loop.performance.now();
        const delta = (now - this.time) / 1000;

        this.callback(delta);

        this.time = now;
    }

    public stop(): void {
        Loop.clearInterval(this.timer);
    }

    public restart(): void {
        this.stop();
        this.start();
    }

    public set tickrate(value: number) {
        this._tickrate = value;
        this.interval = 1000 / this._tickrate;
    }

    public get tickrate(): number {
        return this._tickrate;
    }

    public static setContext(context: Context): void {
        this.clearInterval = context.clearInterval;
        this.performance = context.performance;
    }
}
