import {MessageSystem, Opcode, SerdeSystem} from "@leela/common";
import {io, Socket} from "socket.io-client";
import {CLIENT_CMD_LOOP, CLIENT_UPDATE_RATE, SERVER_HOST} from "../constants/config";
import Ticks from "./Ticks";
import IncomingSystem from "./IncomingSystem";
import ConnectionSystem from "./ConnectionSystem";
import OutgoingSystem from "./OutgoingSystem";
import SimulationSystem from "./SimulationSystem";
import CommandSystem from "./CommandSystem";
import InterpolateSystem from "./interpolation/InterpolateSystem";
import SyncSystem from "./SyncSystem";
import PredictSystem from "./prediction/PredictSystem";

export default class NetworkSystem {

    public socket: Socket;
    public ticks: Ticks;
    public messages: MessageSystem;
    public incoming: IncomingSystem;
    public connections: ConnectionSystem;
    public sync: SyncSystem;
    public outgoing: OutgoingSystem;
    public simulations: SimulationSystem;
    public cmd: CommandSystem;
    public interpolations: InterpolateSystem;
    public predictions: PredictSystem;

    constructor(private readonly serde: SerdeSystem) {
    }

    public init(): void {
        this.socket = io(SERVER_HOST);

        this.ticks = new Ticks();

        this.messages = new MessageSystem(this.serde);
        this.incoming = new IncomingSystem(this.ticks, this.messages);
        this.connections = new ConnectionSystem(this.socket, this.incoming);
        this.sync = new SyncSystem(this.socket);

        this.outgoing = new OutgoingSystem(this.socket, this.ticks, this.serde);
        this.simulations = new SimulationSystem(this.ticks);
        this.cmd = new CommandSystem(this.outgoing);

        this.interpolations = new InterpolateSystem(this.ticks, this.sync);
        this.predictions = new PredictSystem(this.ticks);

        this.connections.init();

        this.simulations.loop.start();
        if (CLIENT_CMD_LOOP) this.cmd.loop.start();

        this.socket.on("connect", () => this.outgoing.push(Opcode.CMSG_UPDATE_RATE, CLIENT_UPDATE_RATE));
    }
}
