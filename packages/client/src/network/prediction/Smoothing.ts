import {Diff, Equals, State} from "../State";
import {Interpolator} from "../interpolation/interpolate";
import Prediction from "./Prediction";

type SmoothOptions<S extends State> = {
    maxMs?: number,
    equals: Equals<S>,
    interpolator: Interpolator<S>,
    diff: Diff<S>,
    withinPrecision: (error: S) => boolean,
    withinSmoothThreshold: (error: S) => boolean
};

export default class Smoothing<S extends State> {

    private errorTimer: number;

    constructor(
        private readonly prediction: Prediction<S, State>,
        private readonly options: SmoothOptions<S>
    ) {
        this.clearError();
    }

    public refreshError() {
        const options = this.options;

        const predicted = this.prediction.predicted;
        const reconciled = this.prediction.reconciled;

        if (!predicted || !reconciled) return;

        const error = options.diff(predicted, reconciled);

        if (this.options.withinPrecision(error)) {
            this.clearError();
        } else {
            if (options.withinSmoothThreshold(error)) {
                if (this.errorTimer == -1) {
                    this.errorTimer = 0;

                    console.log(`start fix`);
                }
            } else {
                this.prediction.predicted = this.prediction.target = this.prediction.reconciled;

                this.clearError();

                console.log(`snap`)
            }
        }
    }

    public smoothError(delta: number) {
        if (this.errorTimer >= 0) {
            const options = this.options;

            this.errorTimer += delta;

            const progress = Math.min(this.errorTimer / this.options.maxMs, 1);

            const predicted = this.prediction.predicted;
            const target = this.prediction.target;
            const reconciled = this.prediction.reconciled;

            options.interpolator(predicted, reconciled, progress, target);

            const offset = options.diff(target, reconciled);

            if (options.withinPrecision(offset)) {
                this.prediction.predicted = this.prediction.reconciled;

                this.clearError();

                console.log(`finish fix`);
            }
        }
    }

    public clearError(): void {
        this.errorTimer = -1;
    }
}
