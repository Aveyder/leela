import TimeStep = Phaser.Core.TimeStep;

export default class TimeStepLoop {

    private _tickrate: number;

    private timestep: TimeStep;

    constructor(
        private readonly callback: (delta: number) => void,
        tickrate: number
    ) {
        this.tickrate = tickrate;
    }

    public start(): void {
        this.timestep.start((time, delta) => this.tick(delta));
    }

    public stop(): void {
        this.timestep.stop();
    }

    private tick(delta: number):void {
        this.callback(delta / 1000);
    }

    public set tickrate(value: number) {
        this._tickrate = value;

        const started = this.timestep?.started;

        if (this.timestep) {
            this.timestep.stop();
        }

        this.timestep = new TimeStep(null, {
            target: this._tickrate,
            forceSetTimeOut: true
        });

        if (started) {
            this.start();
        }
    }

    public get tickrate(): number {
        return this._tickrate;
    }
}
