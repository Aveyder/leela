import "phaser";
import "../scss/styles.scss";
import {io} from "socket.io-client";
import {CLIENT_UPDATE_RATE, SERVER_HOST} from "./constants/config";
import OutgoingSystem from "./network/OutgoingSystem";
import {MessageSystem, Opcode} from "@leela/common";
import ConnectionSystem from "./network/ConnectionSystem";
import SimulationLoop from "./loops/SimulationLoop";
import Ticks from "./network/Ticks";
import IncomingSystem from "./network/IncomingSystem";

const socket = io(SERVER_HOST);

const ticks = new Ticks();

const messages = new MessageSystem();
const incoming = new IncomingSystem(ticks, messages);
const connections = new ConnectionSystem(socket, incoming);
connections.init();

const outgoing = new OutgoingSystem(socket);
const simulations = new SimulationLoop(ticks, outgoing);
simulations.start();

outgoing.push(Opcode.UpdateRate, [CLIENT_UPDATE_RATE]);
