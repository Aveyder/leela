import {State} from "../types";
import {Tick} from "@leela/common";
import Transaction from "./Transaction";


interface Applicator<S extends State, C extends State> {
    (state: S, control: C, delta?: number): S;
}

function reconcile<S extends State, C extends State>(
    transactions: Transaction<C>[],
    ack: Tick, state: S,
    applicator: Applicator<S, C>
): S {
    let ackIndex = -1;
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].tick == ack &&
            (i == transactions.length - 1 || transactions[i + 1].tick != ack)
        ) {
            ackIndex = i;
            break;
        }
    }

    transactions.splice(0, ackIndex + 1);

    for (let i = 0; i < transactions.length; i++) {
        state = applicator(state, transactions[i].control, transactions[i].delta);
    }
    return state;
}

export {
    Applicator,
    reconcile
};