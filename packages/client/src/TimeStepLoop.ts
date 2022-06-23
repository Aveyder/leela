import TimeStep = Phaser.Core.TimeStep;

export default class TimeStepLoop {

    private timestep: TimeStep;

    public start(callback: (delta: number) => void, tickrate: number): void {
        this.timestep = new TimeStep(null, {
            target: tickrate,
            forceSetTimeOut: true
        });
        this.timestep.start((time, delta) => {
            callback(delta / 1000)
        });
    }

    public stop(): void {
        this.timestep.stop();
    }
}
