import {State} from "../State";
import {Applicator, reconcile} from "./reconcile";
import {SIMULATION_DELTA_MS, Tick} from "@leela/common";
import Transaction from "./Transaction";
import {Interpolator} from "../interpolation/interpolate";

interface Cloner<S extends State> {
    (state: S, result?: S): S;
}

export default class Prediction<S extends State, C extends State> {

    private transactions: Transaction<C>[];

    public lerpProgress: number;
    private lerpStart: number;
    private lerpDuration: number;

    private initial: S;
    public predicted: S;
    public target: S;
    public reconciled: S;
    private tmpState: S;

    constructor(
        private readonly applicator: Applicator<S, C>,
        private readonly stateCloner: Cloner<S>,
        private readonly interpolator: Interpolator<S>
    ) {
        this.reset();
    }

    public predict(state: S, transaction: Transaction<C>): void {
        this.transactions.push(transaction);

        this.doPredict(state, transaction.control);
    }

    private doPredict(state: S, control: C) {
        const now = Date.now();

        const lastLerpDuration = now - this.lerpStart;

        if (lastLerpDuration > this.lerpDuration) {
            this.lerpDuration = SIMULATION_DELTA_MS;
        } else {
            this.lerpDuration = 2 * SIMULATION_DELTA_MS - lastLerpDuration;
        }

        this.lerpStart = now;

        this.initial = !this.initial ? this.stateCloner(state) : this.stateCloner(state, this.initial);

        if (!this.predicted) {
            this.predicted = this.stateCloner(state);
        }

        this.predicted = this.applicator(this.predicted, control);

        this.target = !this.target ? this.stateCloner(this.predicted) : this.stateCloner(this.predicted, this.target);
    }

    public reconcile(ack: Tick, state: S): void {
        this.reconciled = reconcile(this.transactions, ack, state, this.applicator);
    }

    public getPrediction(): S {
        if (this.predicted) {
            this.lerpProgress = Math.min(1, (Date.now() - this.lerpStart) / this.lerpDuration);

            if (!this.tmpState) this.tmpState = this.stateCloner(this.initial);

            return this.lerpProgress > 0 ? this.interpolator(this.initial, this.target, this.lerpProgress, this.tmpState) : null;
        }
    }

    public reset(): void {
        this.transactions = [];

        this.lerpProgress = -1;
        this.lerpStart = -1;
        this.lerpDuration = -1;
    }
}

export {
    Prediction
};
