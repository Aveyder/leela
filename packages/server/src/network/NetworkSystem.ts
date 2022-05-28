import ServerSystem from "./ServerSystem";
import SocketSystem from "./SocketSystem";
import PacketSystem from "./PacketSystem";
import RoomSystem from "./RoomSystem";
import Ticks from "./Ticks";
import IncomingSystem from "./IncomingSystem";
import OutgoingSystem from "./OutgoingSystem";
import SnapshotSystem from "./SnapshotSystem";
import ConnectionSystem from "./ConnectionSystem";
import SimulationSystem from "./SimulationSystem";
import {MessageSystem, Opcode, SerdeSystem} from "@leela/common";

export default class NetworkSystem {

    public servers: ServerSystem;
    public sockets: SocketSystem;
    public packets: PacketSystem;
    public rooms: RoomSystem;
    public ticks: Ticks;
    public messages: MessageSystem;
    public incoming: IncomingSystem;
    public outgoing: OutgoingSystem;
    public snapshots: SnapshotSystem;
    public connections: ConnectionSystem;
    public simulations: SimulationSystem;

    constructor(private readonly serde: SerdeSystem) {
    }

    public init(): void {
        this.servers = new ServerSystem();
        this.servers.bootstrap();

        this.sockets = new SocketSystem();
        this.packets = new PacketSystem(this.serde);
        this.rooms = new RoomSystem(this.packets);

        this.ticks = new Ticks();

        this.messages = new MessageSystem(this.serde);
        this.incoming = new IncomingSystem(
            this.ticks, this.packets.incoming, this.messages
        );

        this.outgoing = new OutgoingSystem(
            this.ticks, this.sockets, this.packets.outgoing
        );
        this.snapshots = new SnapshotSystem(this.outgoing);
        this.connections = new ConnectionSystem(
            this.servers.io, this.sockets, this.packets, this.snapshots
        );
        this.simulations = new SimulationSystem(
            this.ticks, this.incoming
        );

        this.connections.init();

        this.simulations.loop.start();

        this.messages.on(Opcode.UpdateRate, (rate: number, id) => {
            this.snapshots.set(id, rate);
        });
    }
}
