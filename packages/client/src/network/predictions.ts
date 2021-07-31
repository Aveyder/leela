export type SequenceId = string;
export type State = unknown;
export type Transaction = unknown;

export interface TransactionReducer<S extends State, T extends Transaction> {
    (accumulator: S, transaction: T, index?: number, transactions?: T[]): S;
}

interface Sequence<S extends State, T extends Transaction> {
    index: number;
    transactions: T[];
    reducer: TransactionReducer<S, T>;
}

export class PredictionSystem {

    private sequences: Record<SequenceId, Sequence<State, Transaction>>;

    constructor() {
        this.reset();
    }

    public createSequence(id: SequenceId, reducer: TransactionReducer<State, Transaction>): void {
        this.sequences[id] = {
            index: -1,
            transactions: [],
            reducer
        };
    }

    public record(id: SequenceId, transaction: Transaction): void {
        const sequence = this.sequences[id];

        if (sequence) {
            sequence.transactions.push(transaction);
            sequence.index++;
        }
    }

    public reconcile<S extends State, T extends Transaction>(id: SequenceId, ackIndex: number, ackState: S): S {
        const sequence = this.sequences[id] as Sequence<S, T>;

        const {index, transactions, reducer} = sequence;

        const lag = index - ackIndex;
        const discard = transactions.length - lag;
        transactions.splice(0, discard);

        return transactions.reduce(reducer, ackState);
    }

    public reset(): void {
        this.sequences = {};
    }
}
