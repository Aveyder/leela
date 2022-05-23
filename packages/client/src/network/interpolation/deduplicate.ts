import Snapshot from "./Snapshot";
import {State, Equals} from "../State";
import {INTERPOLATE_DEDUPLICATE_MAX} from "../../constants/config";


function deduplicate<S extends State>(buffer: Snapshot<S>[], equals: Equals<S>): Snapshot<S>[] {
    if (buffer.length > 3) {
        const result = [...buffer];
        let count = 0;
        let prev;
        for (let i = 0; i < result.length; i++) {
            const cur = result[i];

            if (i > 0) {
                if (equals(prev.state, cur.state)) {
                    if (count > 0) count++;
                } else {
                    if (count > 1 && count <= INTERPOLATE_DEDUPLICATE_MAX) {
                        const removeAmount = count - 1;
                        const start = i - removeAmount;
                        result.splice(start, removeAmount);
                        i = start;
                    }
                    count = 1;
                }
            }

            prev = cur;
        }
        return result;
    } else {
        return buffer;
    }
}

export {
    deduplicate
};
