import {Loop, MessageSystem, Opcode} from "@leela/common";
import {io, Socket} from "socket.io-client";
import {CLIENT_UPDATE_RATE, SERVER_HOST} from "../constants/config";
import Ticks from "./Ticks";
import IncomingSystem from "./IncomingSystem";
import ConnectionSystem from "./ConnectionSystem";
import OutgoingSystem from "./OutgoingSystem";
import SimulationSystem from "./SimulationSystem";
import CommandSystem from "./CommandSystem";
import {ReconcileSystem} from "./reconcile";
import InterpolateSystem from "./interpolation/InterpolateSystem";

export default class NetworkSystem {

    public socket: Socket;
    public ticks: Ticks;
    public messages: MessageSystem;
    public incoming: IncomingSystem;
    public connections: ConnectionSystem;
    public outgoing: OutgoingSystem;
    public simulations: SimulationSystem;
    public cmd: CommandSystem;
    public interpolations: InterpolateSystem;
    public reconciliation: ReconcileSystem;

    public init(): void {
        Loop.setContext({performance, clearInterval});

        this.socket = io(SERVER_HOST);

        this.ticks = new Ticks();

        this.messages = new MessageSystem();
        this.incoming = new IncomingSystem(this.ticks, this.messages);
        this.connections = new ConnectionSystem(this.socket, this.incoming);

        this.outgoing = new OutgoingSystem(this.socket, this.ticks);
        this.simulations = new SimulationSystem(this.ticks);
        this.cmd = new CommandSystem(this.outgoing);

        this.interpolations = new InterpolateSystem(this.ticks);
        this.reconciliation = new ReconcileSystem(this.ticks);

        this.connections.init();

        this.simulations.loop.start();
        this.cmd.loop.start();

        this.outgoing.push(Opcode.UpdateRate, [CLIENT_UPDATE_RATE]); // now?
    }
}
