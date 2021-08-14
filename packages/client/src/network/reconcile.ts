import Ticks from "./Ticks";
import {State} from "./types";
import {CLIENT_PREDICT, CLIENT_SMOOTH, CLIENT_SMOOTH_MS} from "../constants/config";

type SequenceId = string;

interface Operator<S extends State> {
    sum(s1: S, s2: S): S;
    diff(s1: S, s2: S): S;
    mul(s1: S, scalar: number): S;
    eq(s1: S, s2: S): boolean;
}

interface Sequence<S extends State> {
    lastUpdateTick: number;
    states: S[];
    error: S;
    smoothTimer: number;
    lastAckState: S;
    operator: Operator<S>
}

class ReconcileSystem {

    private sequences: Record<SequenceId, Sequence<State>>;

    constructor(
        private readonly ticks: Ticks
    ) {
        this.reset();
    }

    public register<S extends State>(id: SequenceId, operator: Operator<S>): void {
        this.sequences[id] = {
            lastUpdateTick: -1,
            states: [],
            error: null,
            smoothTimer: 0,
            lastAckState: null,
            operator
        };
    }

    public reconcile<S extends State>(id: SequenceId, state?: S, delta?: number): S {
        const sequence = this.sequences[id] as Sequence<S>;

        if (CLIENT_PREDICT) {
            const operator = sequence.operator;

            if (sequence.error) {
                if (CLIENT_SMOOTH) {
                    const fraction = Math.min(delta, sequence.smoothTimer) / (CLIENT_SMOOTH_MS / 1000);
                    const correction = operator.mul(sequence.error, fraction);
                    state = operator.sum(state, correction);

                    sequence.smoothTimer = Math.min(sequence.smoothTimer - delta, 0);
                    if (sequence.smoothTimer == 0) sequence.error = null;
                } else {
                    state = operator.sum(state, sequence.error);

                    sequence.error = null;
                }
            }

            if (this.isStateUpdate(sequence, state)) {
                sequence.states.push(state);
                sequence.lastUpdateTick = this.ticks.client;
            }

            return state;
        }

        return sequence.lastAckState || state;
    }

    private isStateUpdate(sequence: Sequence<State>, state: State) {
        const states = sequence.states;
        const operator = sequence.operator;

        if (states.length == 0) {
            return !(sequence.lastAckState && operator.eq(sequence.lastAckState, state));
        } else {
            return !operator.eq(states[states.length - 1], state);
        }
    }

    public ack<S extends State>(id: SequenceId, ackState: S): void {
        const sequence = this.sequences[id] as Sequence<S>;

        if (CLIENT_PREDICT && sequence.states.length > 0) {
            const lag = sequence.lastUpdateTick - this.ticks.clientAck;

            const states = sequence.states;

            const predIndex = (states.length - 1) - lag;
            const predState = states[predIndex];

            const operator = sequence.operator;

            sequence.error = operator.diff(predState, ackState);

            if (CLIENT_SMOOTH && sequence.error) {
                sequence.smoothTimer = CLIENT_SMOOTH_MS / 1000;
            }

            states.splice(0, predIndex + 1);
        }

        sequence.lastAckState = ackState;
    }

    public reset(): void {
        this.sequences = {};
    }
}

export {
    SequenceId,
    State,
    Operator,
    ReconcileSystem
};
