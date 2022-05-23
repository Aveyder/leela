export default class Loop {

    private _tickrate: number;
    private interval: number;

    private prevTick: number;
    private curTick: number;

    private started: boolean;

    constructor(
        private readonly callback: (delta: number) => void,
        tickrate: number
    ) {
        this.tickrate = tickrate;

        this.prevTick = Date.now();
        this.curTick = 0;

        this.started = false;
    }

    public start(): void {
        this.started = true;
        this.tick();
    }

    public stop(): void {
        this.started = false;
    }

    private tick():void {
        if (!this.started) return;

        const now = Date.now();

        this.curTick++;
        if (this.prevTick + this.interval <= now) {
            const delta = (now - this.prevTick) / 1000;
            this.prevTick = now;

            this.callback(delta);

            this.curTick = 0;
        }

        if (Date.now() - this.prevTick < this.interval - 16) {
            setTimeout(() => this.tick());
        } else {
            setImmediate(() => this.tick());
        }
    }

    public set tickrate(value: number) {
        this._tickrate = value;
        this.interval = 1000 / this._tickrate;
    }

    public get tickrate(): number {
        return this._tickrate;
    }
}
