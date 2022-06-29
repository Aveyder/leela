import {expect} from "chai";
import "mocha";


describe("test", () => {
    it("#1", () => {
        expect({"a": [1,2,3]}).to.deep.equal({"a": [1,2,3]});
    });
});
