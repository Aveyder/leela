import {Data} from "./types";

interface Serializer<D> {
    serialize(input: D): Data;
}

interface Deserializer<D> {
    deserialize(input: Data): D;
}

class NoopSerializer implements Serializer<unknown>{
    public serialize(input: unknown) {
        return input;
    }
}

class NoopDeserializer implements Deserializer<unknown>{
    public deserialize(input: Data) {
        return input;
    }
}

function serializer<D>(serialize: (input: D) => Data): Serializer<D> {
    return {serialize};
}

function deserializer<D>(deserialize: (input: Data) => D): Deserializer<D> {
    return {deserialize};
}

export {
    Serializer,
    Deserializer,
    NoopSerializer,
    NoopDeserializer,
    serializer,
    deserializer
}
