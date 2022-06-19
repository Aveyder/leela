import {expect} from "chai";
import "mocha";
import {Applicator, reconcile} from "../src/network/prediction/reconcile";
import Transaction from "../src/network/prediction/Transaction";

type Vec2 = {x: number, y: number};

const applicator:Applicator<Vec2, Vec2> = (state, control) => {
    state.x += control.x;
    state.y += control.y;

    if (state.x > 20 && state.y > 0 && state.y < 20) {
        state.x = 20;
    }

    return state;
};

describe("reconcile", () => {
    it("should reconcile to a proper position", () => {
        const transactions: Transaction<Vec2>[] = [
            {control: {x: 0, y: 10}, tick: 0},
            {control: {x: 0, y: 10}, tick: 1},
            {control: {x: 10, y: 0}, tick: 2},
            {control: {x: 10, y: 0}, tick: 3},
            {control: {x: 10, y: 0}, tick: 4}
        ]
        const result = reconcile(transactions, 0, {x: 0, y: 0}, applicator);

        expect(result.x).to.equal(20);
        expect(result.y).to.equal(10);

        expect(transactions.length).to.equal(4);
        expect(transactions[0].tick).to.equal(1);
    });
});
