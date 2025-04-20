import TimeStep = Phaser.Core.TimeStep;
import { Game } from "phaser";

export default class Loop {

    private timestep: TimeStep;

    public start(callback: (delta: number) => void, tickrate: number): void {
        this.timestep = new TimeStep({} as Game, {
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
