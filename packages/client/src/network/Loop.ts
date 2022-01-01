export default class Loop {

    private _tickrate: number;
    private interval: number;

    private expected: number;
    private timeout: unknown;

    constructor(
        private readonly callback: (delta: number) => void,
        tickrate: number
    ) {
        this.tickrate = tickrate;
    }

    public start(): void {
        this.expected = Date.now() + this.interval;
        this.timeout = setTimeout(() => this.tick(), this.interval);
    }

    public stop(): void {
        clearTimeout(this.timeout as number);
    }

    private tick():void {
        const drift = Date.now() - this.expected;

        this.callback((this.interval - drift) / 1000);

        this.expected += this.interval;
        this.timeout = setTimeout(() => this.tick(), Math.max(0, this.interval - drift));
    }

    public set tickrate(value: number) {
        this._tickrate = value;
        this.interval = 1000 / this._tickrate;
    }

    public get tickrate(): number {
        return this._tickrate;
    }
}
