import {MessageSystem, Opcode} from "@leela/common";
import NetworkSystem from "./network/NetworkSystem";
import SocketSystem from "./network/SocketSystem";
import PacketSystem from "./network/PacketSystem";
import OutgoingSystem from "./network/OutgoingSystem";
import ConnectionSystem from "./network/ConnectionSystem";
import RoomSystem from "./network/RoomSystem";
import Ticks from "./network/Ticks";
import SimulationLoop from "./loops/SimulationLoop";
import IncomingSystem from "./network/IncomingSystem";
import UpdateRateSystem from "./network/UpdateRateSystem";
import {PREPARE_SNAPSHOT, SEND_SNAPSHOT} from "./constants/events";

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
const connections = new ConnectionSystem(
    network.io, sockets, packets
);
connections.init();

const outgoing = new OutgoingSystem(
    ticks, sockets, packets.outgoing
);
const updateRate = new UpdateRateSystem(sockets);
const simulations = new SimulationLoop(
    ticks, incoming
);
simulations.events.on(PREPARE_SNAPSHOT, (delta) => {
    updateRate.tick(delta);
});
simulations.events.on(SEND_SNAPSHOT, () => {
    outgoing.send();
    updateRate.flush();
});
simulations.start();

messages.on(Opcode.UpdateRate, (data, id) => {
    updateRate.set(id, data.shift() as number);
});
