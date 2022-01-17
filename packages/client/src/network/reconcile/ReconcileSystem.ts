import {State} from "../State";
import Ticks from "../Ticks";
import Sequence from "./Sequence";

type SequenceId = string;

export default class ReconcileSystem {

    public readonly sequences: Record<SequenceId, Sequence<State, State>>;

    constructor(
        private readonly ticks: Ticks
    ) {
        this.sequences = {};
    }

    public push<C extends State>(id: SequenceId, control: C, delta: number): void {
        const tick = this.ticks.client;
        this.sequences[id].push({control, delta, tick});
    }

    public reconcile<S extends State>(id: SequenceId, state: S): S {
        return (this.sequences[id] as Sequence<S, State>).reconcile(this.ticks.server.ack, state);
    }

    public reset(): void {
        Object.values(this.sequences).forEach(sequence => sequence.reset());
    }
}
