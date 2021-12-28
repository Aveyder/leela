import Ticks from "./Ticks";
import {State} from "./types";
import {CLIENT_PREDICT, CLIENT_SMOOTH, CLIENT_SMOOTH_MS} from "../constants/config";

type SequenceId = string;

interface Operator<S extends State> {
    sum(s1: S, s2: S): S;
    diff(s1: S, s2: S): S;
    mul(s: S, scalar: number): S;
    eq(s1: S, s2: S): boolean;
}

interface Sequence<S extends State> {
    lastUpdateTick: number;
    states: S[];
    error: S;
    smoothTimer: number;
    lastAckState: S;
    lastAckTick: number;
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
            lastAckTick: -1,
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

            const states = sequence.states;

            if (states.length > 0 && sequence.lastAckTick == this.ticks.client) {
                states[states.length - 1] = state;
            } else {
                states.push(state);
            }
            sequence.lastUpdateTick = this.ticks.client;

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

        const clientAck = this.ticks.server.ack;
        if (CLIENT_PREDICT) {
            if (sequence.states.length > 0 && sequence.lastAckTick != clientAck) {
                const lag = sequence.lastUpdateTick - clientAck;
                const states = sequence.states;

                const predIndex = (states.length - 1) - lag;
                const predState = states[predIndex];

                sequence.error = sequence.operator.diff(predState, ackState);

                if (CLIENT_SMOOTH && sequence.error) {
                    sequence.smoothTimer = CLIENT_SMOOTH_MS / 1000;
                }

                states.splice(0, predIndex + 1);
            }
        }

        sequence.lastAckState = ackState;
        sequence.lastAckTick = clientAck;
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
