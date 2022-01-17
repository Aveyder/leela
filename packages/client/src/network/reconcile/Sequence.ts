import {State} from "../State";
import {Applicator, reconcile} from "./reconcile";
import {Tick} from "@leela/common";
import Transaction from "./Transaction";


export default class Sequence<S extends State, C extends State> {

    private transactions: Transaction<C>[];

    constructor(
        private readonly applicator: Applicator<S, C>
    ) {
        this.reset();
    }

    public push(transaction: Transaction<C>): void {
        this.transactions.push(transaction);
    }

    public reconcile(ack: Tick, state: S): S {
        return reconcile(this.transactions, ack, state, this.applicator);
    }

    public reset(): void {
        this.transactions = [];
    }
}

export {
    Sequence
};