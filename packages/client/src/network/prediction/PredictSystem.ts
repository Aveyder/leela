import {State} from "../State";
import Prediction from "./Prediction";
import Ticks from "../Ticks";

type SequenceId = string;

export default class PredictSystem {

    public readonly map: Record<SequenceId, Prediction<State, State>>;

    constructor(
        private readonly ticks: Ticks
    ) {
        this.map = {};
    }

    public predict<S extends State, C extends State>(id: SequenceId, state: S, control: C): void {
        const tick = this.ticks.client;
        (this.map[id] as Prediction<State, C>).predict(state, {tick, control});
    }

    public reconcile<S extends State>(id: SequenceId, state: S): void {
        (this.map[id] as Prediction<S, State>).reconcile(this.ticks.server.ack, state);
    }

    public getPrediction<S extends State>(id: SequenceId): S {
        return (this.map[id] as Prediction<S, State>).getPrediction();
    }

    public reset(): void {
        Object.values(this.map).forEach(sequence => sequence.reset());
    }
}
