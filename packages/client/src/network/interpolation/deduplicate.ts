import Snapshot from "./Snapshot";
import {Equals, State} from "../State";


function deduplicate<S extends State>(buffer: Snapshot<S>[], snapshot: Snapshot<S>, equals: Equals<S>, max = 2) {
    if (buffer.length > 2) {
        const lastIndex = buffer.length - 1;
        const last = buffer[lastIndex];
        if (!equals(snapshot.state, last.state)) {
            let count = 1;
            for(let i = lastIndex - 1; i >= 0; i--) {
                const cur = buffer[i];
                if (equals(cur.state, last.state)) {
                    if (count < max) {
                        count++;
                    } else {
                        break;
                    }
                } else {
                    if (count > 1) {
                        buffer.splice(i + 2);
                        console.log(`drop ${count}`);
                    }
                    break;
                }
            }
        }
    }
}

export {
    deduplicate
};
