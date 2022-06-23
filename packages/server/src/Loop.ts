export default class Loop {

    private callback: (delta: number) => void;
    private _tickrate: number;
    private interval: number;
    private prevTick: number;
    private started: boolean;
    private stopCallback: () => void;

    constructor() {
        this.started = false;
    }

    public start(callback: (delta: number) => void, tickrate: number): Loop {
        this.callback = callback;

        this.started = true;

        this._tickrate = tickrate;

        this.interval = 1000 / this._tickrate;

        this.prevTick = Date.now();

        this.tick();

        return this;
    }

    public get tickrate() {
        return this._tickrate;
    }

    public stop(): void {
        if (this.stopCallback && this.started) this.stopCallback();

        this.started = false;
    }

    public onStop(callback: () => void) {
        this.stopCallback = callback;
    }

    private tick():void {
        if (!this.started) return;

        const now = Date.now();

        if (this.prevTick + this.interval <= now) {
            const delta = (now - this.prevTick) / 1000;
            this.prevTick = now;

            this.callback(delta);
        }

        if (Date.now() - this.prevTick < this.interval - 16) {
            setTimeout(() => this.tick());
        } else {
            setImmediate(() => this.tick());
        }
    }
}
