import {PlayerId} from "../world/types";
import {Char} from "../world/Char";
import {Data} from "./types";

function serializeSnapshot(chars: Record<PlayerId, Char>): Data {
    const data = [] as Data;

    Object.keys(chars).forEach(id => {
        const char = chars[id];

        data.push(Number(id));
        data.push(char.morph);
        data.push(char.x);
        data.push(char.y);
    });

    return data;
}

function deserializeSnapshot(data: Data): Record<PlayerId, Char> {
    const chars = {};
    for (let i = 0; i < data.length; i += 4) {
        chars[data[i] as PlayerId] = {
            morph: data[i + 1],
            x: data[i + 2],
            y: data[i + 3]
        };
    }

    return chars;
}

export {
    serializeSnapshot,
    deserializeSnapshot
}
