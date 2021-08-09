import "phaser";
import "../scss/styles.scss";
import {io} from "socket.io-client";
import {CLIENT_UPDATE_RATE, SERVER_HOST} from "./constants/config";
import OutgoingSystem from "./network/OutgoingSystem";
import {MessageSystem, Opcode} from "@leela/common";
import ConnectionSystem from "./network/ConnectionSystem";
import Ticks from "./network/Ticks";
import IncomingSystem from "./network/IncomingSystem";
import {Loop} from "@leela/common";
import SimulationSystem from "./loops/SimulationSystem";
import CommandSystem from "./loops/CommandSystem";

Loop.setContext({performance, clearInterval});

const socket = io(SERVER_HOST);

const ticks = new Ticks();

const messages = new MessageSystem();
const incoming = new IncomingSystem(ticks, messages);
const connections = new ConnectionSystem(socket, incoming);
connections.init();

const outgoing = new OutgoingSystem(socket, ticks);
const simulations = new SimulationSystem(ticks);
simulations.loop.start();
const cmd = new CommandSystem(outgoing);
cmd.loop.start();

outgoing.push(Opcode.UpdateRate, [CLIENT_UPDATE_RATE]);
