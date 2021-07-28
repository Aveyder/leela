import IncomingSystem from "@leela/common/src/network/IncomingSystem";
import NetworkSystem from "./network/NetworkSystem";
import SocketSystem from "./network/SocketSystem";
import PacketSystem from "./network/PacketSystem";
import OutgoingSystem from "./network/OutgoingSystem";
import ConnectionSystem from "./network/ConnectionSystem";
import {UPDATE_TIME} from "./constants/config";
import {setIntervalAsync} from "./util/interval";

const network = new NetworkSystem();
network.bootstrap();
const sockets = new SocketSystem();
const packets = new PacketSystem();
const incoming = new IncomingSystem();
const outgoing = new OutgoingSystem(
    sockets, packets.outgoing
);
const connections = new ConnectionSystem(
    network.io, sockets, packets
);
connections.init();

function start() {
    const interval = 1000 / UPDATE_TIME;

    setIntervalAsync(async () => {
        outgoing.send();

        incoming.receivePacket(packets.incoming);
    }, interval);
}

start();
