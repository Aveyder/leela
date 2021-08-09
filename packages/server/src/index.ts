import {MessageSystem, Opcode} from "@leela/common";
import NetworkSystem from "./network/NetworkSystem";
import SocketSystem from "./network/SocketSystem";
import PacketSystem from "./network/PacketSystem";
import OutgoingSystem from "./network/OutgoingSystem";
import ConnectionSystem from "./network/ConnectionSystem";
import RoomSystem from "./network/RoomSystem";
import Ticks from "./network/Ticks";
import IncomingSystem from "./network/IncomingSystem";
import SimulationSystem from "./loops/SimulationSystem";
import SnapshotSystem from "./loops/SnapshotSystem";
import Loop from "@leela/common/dist/loops/Loop";
import {performance} from "perf_hooks";

Loop.setContext({performance, clearInterval});

const network = new NetworkSystem();
network.bootstrap();
const sockets = new SocketSystem();
const packets = new PacketSystem();
const rooms = new RoomSystem(packets);

const ticks = new Ticks();

const messages = new MessageSystem();
const incoming = new IncomingSystem(
    ticks, packets.incoming, messages
);

const outgoing = new OutgoingSystem(
    ticks, sockets, packets.outgoing
);
const snapshots = new SnapshotSystem(outgoing);
const connections = new ConnectionSystem(
    network.io, sockets, packets, snapshots
);
connections.init();

const simulations = new SimulationSystem(
    ticks, incoming
);
simulations.loop.start();

messages.on(Opcode.UpdateRate, (data, id) => {
    snapshots.set(id, data.shift() as number);
});
