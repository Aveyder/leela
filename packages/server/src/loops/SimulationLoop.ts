import {performance} from "perf_hooks";
import Ticks from "../network/Ticks";
import {
    ClientId,
    ClientPacket,
    IncomingSystem,
    Message,
    SIMULATION_INTERVAL_MS,
    Stamp,
    Tick,
    Timestamp
} from "@leela/common";
import {AddressedPacket} from "../network/types";

export default class SimulationLoop {

    private lastSimulation: number;

    constructor(
        private readonly ticks: Ticks,
        private readonly packetsIncoming: AddressedPacket[],
        private readonly incoming: IncomingSystem,
    ) {
    }

    public start(): void {
        this.lastSimulation = performance.now();

        setInterval(() => {
            this.ticks.server++;

            this.receivePacketsIncoming();
            this.simulate();
        }, SIMULATION_INTERVAL_MS);
    }

    private receivePacketsIncoming() {
        this.packetsIncoming.forEach(addressed => {
            const [id, clientPacket] = addressed;

            this.receivePacketIncoming(id, clientPacket);
        });

        this.packetsIncoming.length = 0;
    }

    private receivePacketIncoming(id: ClientId, clientPacket: ClientPacket) {
        const timestamp = clientPacket.shift() as Timestamp;
        const tick = clientPacket.shift() as Tick;

        const stamp = this.ticks.clients[id] as Stamp;

        const outdated = stamp && (stamp.timestamp > timestamp || stamp.tick > tick);

        if (!outdated) {
            this.incoming.receiveMessages(clientPacket as Message[], id);

            this.ticks.clients[id] = {timestamp, tick};
        }
    }

    private simulate() {
        const now = performance.now();
        const delta = now - this.lastSimulation;

        // simulate world with 'delta'

        this.lastSimulation = now;
    }
}
