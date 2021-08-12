import {Tick} from "@leela/common";
import Ticks from "./Ticks";
import {State} from "./types";

type SequenceId = string;
type Transaction = unknown;

interface TransactionReducer<S extends State, T extends Transaction> {
    (accumulator: S, transaction: T, index?: number, transactions?: T[]): S;
}

interface Sequence<S extends State, T extends Transaction> {
    lastTick: Tick;
    transactions: T[];
    reducer: TransactionReducer<S, T>;
}

class ReconcileSystem {

    private sequences: Record<SequenceId, Sequence<State, Transaction>>;

    constructor(
        private readonly ticks: Ticks
    ) {
        this.reset();
    }

    public register<S extends State, T extends Transaction>(id: SequenceId, reducer: TransactionReducer<S, T>): void {
        this.sequences[id] = {
            lastTick: -1,
            transactions: [],
            reducer
        };
    }

    public add(id: SequenceId, transaction: Transaction): void {
        const sequence = this.sequences[id];

        sequence.transactions.push(transaction);
        sequence.lastTick = this.ticks.client;
    }

    public reconcile<S extends State, T extends Transaction>(id: SequenceId, ackState: S): S {
        const sequence = this.sequences[id] as Sequence<S, T>;

        const {lastTick, transactions, reducer} = sequence;

        if (transactions.length > 0) {
            const lag = lastTick - this.ticks.clientAck;
            const discard = transactions.length - lag;

            transactions.splice(0, discard);

            return transactions.reduce(reducer, ackState);
        }

        return ackState;
    }

    public reset(): void {
        this.sequences = {};
    }
}

export {
    SequenceId,
    State,
    Transaction,
    TransactionReducer,
    ReconcileSystem
};
