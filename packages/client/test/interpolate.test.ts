import {expect} from "chai";
import "mocha";
import {interpolate} from "../src/network/interpolation/interpolate";

const numbersInterpolator = (s1, s2, progress) => s1 + (s2 - s1) * progress;
const numbersEquals = (s1, s2) => s1 == s2;

describe("interpolate", () => {
    it("should return undefined for empty buffer (int=false)", () => {
        const result = interpolate<number>(100, [], numbersInterpolator, numbersEquals,{});
        expect(result).to.be.undefined;
    });
    it("should return undefined for empty buffer (int=true)", () => {
        const result = interpolate<number>(100, [], numbersInterpolator, numbersEquals, {
            interpolate: true,
            interpolateMs: 100
        });
        expect(result).to.be.undefined;
    });
    it("should return state for single snapshot (int.moment<snapshot)", () => {
        const result = interpolate<number>(100, [
            {state: 20, timestamp: 50}
        ], numbersInterpolator, numbersEquals, {
            interpolate: true,
            interpolateMs: 100
        });
        expect(result).to.equal(20);
    });
    it("should return state for single snapshot (snapshot<int.moment)", () => {
        const result = interpolate<number>(150, [
            {state: 20, timestamp: 0}
        ], numbersInterpolator, numbersEquals,{
            interpolate: true,
            interpolateMs: 100
        });
        expect(result).to.equal(20);
    });
    it("should return last state for buffer (int=false)", () => {
        const result = interpolate<number>(150, [
            {state: 20, timestamp: 0},
            {state: 40, timestamp: 50},
            {state: 60, timestamp: 100},
        ], numbersInterpolator, numbersEquals, {
            interpolate: false
        });
        expect(result).to.equal(60);
    });
    it("should return first state for buffer (int=true,int.moment<snapshot,ext.past=false)", () => {
        const result = interpolate<number>(150, [
            {state: 20, timestamp: 50},
            {state: 40, timestamp: 100},
        ], numbersInterpolator, numbersEquals, {
            interpolate: true,
            interpolateMs: 100
        });
        expect(result).to.equal(20);
    });
    it("should return last state for buffer (int=true,snapshot<int.moment,ext=false)", () => {
        const result = interpolate<number>(200, [
            {state: 20, timestamp: 0},
            {state: 40, timestamp: 50},
        ], numbersInterpolator, numbersEquals, {
            interpolate: true,
            interpolateMs: 100
        });
        expect(result).to.equal(40);
    });
    it("should return interpolated state for buffer (int=true,snapshot<int.moment<snapshot)", () => {
        const result = interpolate<number>(150, [
            {state: 20, timestamp: 0},
            {state: 40, timestamp: 100},
        ], numbersInterpolator, numbersEquals, {
            interpolate: true,
            interpolateMs: 100
        });
        expect(result).to.equal(30);
    });
    it("should return extrapolated state for buffer (int=true,snapshot<int.moment<ext.max.ms,ext=true)", () => {
        const result = interpolate<number>(400, [
            {state: 20, timestamp: 0},
            {state: 40, timestamp: 100},
        ], numbersInterpolator, numbersEquals, {
            interpolate: true,
            interpolateMs: 100,
            extrapolate: true,
            extrapolateMaxMs: 250
        });
        expect(result).to.equal(80);
    });
    it("should return last state for buffer (int=true,ext.max.ms<int.moment,ext=true)", () => {
        const result = interpolate<number>(500, [
            {state: 20, timestamp: 0},
            {state: 40, timestamp: 100},
        ], numbersInterpolator, numbersEquals, {
            interpolate: true,
            interpolateMs: 100,
            extrapolate: true,
            extrapolateMaxMs: 250
        });
        expect(result).to.equal(40);
    });
    it("should return extrapolated state for buffer (int=true,int.moment<snapshot,ext.past=true)", () => {
        const result = interpolate<number>(100, [
            {state: 20, timestamp: 25},
            {state: 40, timestamp: 50},
        ], numbersInterpolator, numbersEquals, {
            interpolate: true,
            interpolateMs: 100,
            extrapolatePast: true,
        });
        expect(result).to.equal(0);
    });
    it("should return interpolated state for non duplicate states (int=true,snapshot[same]<int.moment<snapshot[same]<snapshot[another])", () => {
        const result = interpolate<number>(160, [
            {state: 20, timestamp: 0},
            {state: 20, timestamp: 100},
            {state: 60, timestamp: 120},
        ], numbersInterpolator, numbersEquals, {
            interpolate: true,
            interpolateMs: 100,
            interpolateDuplicates: false
        });
        expect(result).to.equal(40);
    });
    it("should return interpolated state for duplicate states (int=true,int.dup=true,snapshot[same]<int.moment<snapshot[same]<snapshot[another])", () => {
        const result = interpolate<number>(160, [
            {state: 20, timestamp: 0},
            {state: 20, timestamp: 100},
            {state: 60, timestamp: 120},
        ], numbersInterpolator, numbersEquals, {
            interpolate: true,
            interpolateMs: 100,
            interpolateDuplicates: true
        });
        expect(result).to.equal(20);
    });
});
