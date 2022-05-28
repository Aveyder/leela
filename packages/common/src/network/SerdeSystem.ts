import {Opcode} from "./opcodes";
import {Deserializer, NoopDeserializer, NoopSerializer, Serializer} from "./Serializer";
import {ClientId, Data} from "./types";


export default class SerdeSystem {

    private readonly serializers = {} as  Record<Opcode, Serializer<unknown>>;
    private readonly deserializers = {} as Record<Opcode, Deserializer<unknown>>;

    private readonly noopSerializer = new NoopSerializer();
    private readonly noopDeserializer = new NoopDeserializer();

    public registerSerializer(opcode: Opcode, serializer: Serializer<unknown>) {
        this.serializers[opcode] = serializer;
    }

    public registerDeserializer(opcode: Opcode, deserializer: Deserializer<unknown>) {
        this.deserializers[opcode] = deserializer;
    }

    public serialize<D>(opcode: Opcode, data: D, id?: ClientId): Data {
        const serializer = this.serializers[opcode] as Serializer<D>;

        return (serializer ? serializer : this.noopSerializer).serialize(data, id);
    }

    public deserialize<D>(opcode: Opcode, data: Data): D {
        const deserializer = this.deserializers[opcode] as Deserializer<D>;

        return (deserializer ? deserializer : this.noopDeserializer).deserialize(data) as unknown as D;
    }
}
