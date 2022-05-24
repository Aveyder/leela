import {State} from "../State";

export default interface Snapshot<S extends State> {
    state: S,
    timestamp?: number
}
