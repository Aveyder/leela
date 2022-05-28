import {Diff, Equals, State} from "../State";
import {Interpolator} from "../interpolation/interpolate";

type SmoothOptions<S extends State> = {
    maxMs?: number,
    equals: Equals<S>,
    interpolator: Interpolator<S>,
    diff: Diff<S>,
    withinPrecision: (error: S) => boolean,
    withinSmoothThreshold: (error: S) => boolean
};

export default class Smoothing<S extends State> {

    private pause: boolean;
    public error: S;
    private errorTimer: number;

    private prevRec: S;

    constructor(private readonly options: SmoothOptions<S>) {
        this.clearError();
    }

    public refreshError(real: S, rec: S): boolean {
        const options = this.options;

        const error = options.diff(real, rec);

        if (options.withinPrecision(error)) {
            this.clearError();
        } else {
            if (options.withinSmoothThreshold(error)) {
                this.error = rec;

                this.pause = options.equals(this.prevRec, rec);

                this.prevRec = rec;
            } else {
                this.clearError();

                return true;
            }
        }
    }

    public smoothError(delta: number, real: S): S {
        if (!this.pause && this.error) {
            const options = this.options;

            const progress = Math.min(this.errorTimer / this.options.maxMs, 1);

            const result = options.interpolator(real, this.error, progress)

            this.errorTimer += delta;

            const offset = options.diff(result, this.error);

            if (options.withinPrecision(offset)) {
                this.clearError();
            }

            return result;
        }
    }

    public clearError(): void {
        this.pause = false;
        this.error = null;
        this.errorTimer = 0;
    }
}
