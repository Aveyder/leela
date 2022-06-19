import {Tick} from "@leela/common";
import {State} from "../State";

export default interface Transaction<C extends State> {
    control: C;
    tick: Tick;
}