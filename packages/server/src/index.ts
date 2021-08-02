import {IncomingSystem} from "@leela/common";
import NetworkSystem from "./network/NetworkSystem";
import SocketSystem from "./network/SocketSystem";
import PacketSystem from "./network/PacketSystem";
import OutgoingSystem from "./network/OutgoingSystem";
import ConnectionSystem from "./network/ConnectionSystem";
import RoomSystem from "./network/RoomSystem";
import Ticks from "./network/Ticks";
import SimulationLoop from "./loops/SimulationLoop";
import SnapshotLoop from "./loops/SnapshotLoop";

const network = new NetworkSystem();
network.bootstrap();
const sockets = new SocketSystem();
const packets = new PacketSystem();
const rooms = new RoomSystem(packets);
const incoming = new IncomingSystem();
const ticks = new Ticks();
const outgoing = new OutgoingSystem(
    sockets, packets.outgoing, ticks
);
const connections = new ConnectionSystem(
    network.io, sockets, packets
);
connections.init();

const simulations = new SimulationLoop(
    ticks, packets.incoming, incoming
);
const snapshots = new SnapshotLoop(outgoing);

simulations.start();
snapshots.start();
