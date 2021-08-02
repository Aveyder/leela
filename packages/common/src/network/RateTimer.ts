export default class RateTimer {

    private rate: number;
    private readonly interval: number;
    private timer: number;

    constructor(
        rate: number,
        private readonly invocationRate: number
    ) {
        this.interval = 1 / rate;
        this.timer = 0;
    }

    public tick(delta: number): boolean {
        if (this.rate != this.invocationRate) {
            this.timer += delta;
            if (this.timer >= this.interval) {
                this.timer -= this.interval;
                return true;
            }
        } else {
            return true;
        }
    }
}
