import "../scss/styles.scss";
import {io} from "socket.io-client";
import {SERVER_HOST} from "./constants/config";
import OutgoingSystem from "./network/OutgoingSystem";
import {IncomingSystem, Opcode} from "@leela/common";
import ConnectionSystem from "./network/ConnectionSystem";
import SimulationLoop from "./loops/SimulationLoop";
import Ticks from "./network/Ticks";

const socket = io(SERVER_HOST);
const incoming = new IncomingSystem();
const ticks = new Ticks();
const outgoing = new OutgoingSystem(ticks, socket);
const connections = new ConnectionSystem(
    socket, ticks, incoming
);
connections.init();
const simulations = new SimulationLoop(ticks, outgoing);
simulations.start();

outgoing.push(Opcode.JoinRequest);
