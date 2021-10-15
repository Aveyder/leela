import {State} from "../types";

export default interface Snapshot<S extends State> {
    state: S,
    timestamp: number
}
