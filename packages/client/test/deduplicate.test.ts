import {expect} from "chai";
import "mocha";
import {deduplicate} from "../src/network/interpolation/deduplicate";

const numbersEquals = (s1, s2) => s1 == s2;

const snapshot = (number: number) => {
    return {state: number};
};

const snapshots = (... numbers: number[]) => numbers.map(snapshot);

describe("deduplicate", () => {
    it("test case #1", () => {
        const buffer = snapshots();
        deduplicate<number>(buffer, snapshot(0), numbersEquals, 2);
        expect(buffer).to.deep.equal(snapshots());
    });
    it("test case #2", () => {
        const buffer = snapshots(0);
        deduplicate<number>(buffer, snapshot(1), numbersEquals, 2);
        expect(buffer).to.deep.equal(snapshots(0));
    });
    it("test case #3", () => {
        const buffer = snapshots(0);
        deduplicate<number>(buffer, snapshot(0), numbersEquals, 2);
        expect(buffer).to.deep.equal(snapshots(0));
    });
    it("test case #4", () => {
        const buffer = snapshots(0, 0);
        deduplicate<number>(buffer, snapshot(1), numbersEquals, 2);
        expect(buffer).to.deep.equal(snapshots(0, 0));
    });
    it("test case #5", () => {
        const buffer = snapshots(0, 0);
        deduplicate<number>(buffer, snapshot(0), numbersEquals, 2);
        expect(buffer).to.deep.equal(snapshots(0, 0));
    });
    it("test case #6", () => {
        const buffer = snapshots(1, 0);
        deduplicate<number>(buffer, snapshot(1), numbersEquals, 2);
        expect(buffer).to.deep.equal(snapshots(1, 0));
    });
    it("test case #7", () => {
        const buffer = snapshots(1, 0);
        deduplicate<number>(buffer, snapshot(0), numbersEquals, 2);
        expect(buffer).to.deep.equal(snapshots(1, 0));
    });
    it("test case #8", () => {
        const buffer = snapshots(1, 0, 0);
        deduplicate<number>(buffer, snapshot(1), numbersEquals, 2);
        expect(buffer).to.deep.equal(snapshots(1, 0));
    });
    it("test case #9", () => {
        const buffer = snapshots(1, 0, 0);
        deduplicate<number>(buffer, snapshot(0), numbersEquals, 2);
        expect(buffer).to.deep.equal(snapshots(1, 0, 0));
    });
    it("test case #10", () => {
        const buffer = snapshots(1, 0, 0, 0);
        deduplicate<number>(buffer, snapshot(1), numbersEquals, 2);
        expect(buffer).to.deep.equal(snapshots(1, 0, 0, 0));
    });
});
