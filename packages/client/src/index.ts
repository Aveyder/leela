import "../scss/styles.scss";
import {io} from "socket.io-client";
import {SERVER_HOST} from "./constants/config";
import OutgoingSystem from "./network/OutgoingSystem";
import IncomingSystem from "@leela/common/src/network/IncomingSystem";

const socket = io(SERVER_HOST);
const incoming = new IncomingSystem();
const outgoing = new OutgoingSystem(socket);

socket.on("message", (input: string) => {
    incoming.receive(input);
});
