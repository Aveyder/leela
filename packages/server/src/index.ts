import NetworkSystem from "./network/NetworkSystem";
import World from "./game/world/World";
import Controller from "./game/controller/Controller";
import {init as initSerde} from "./game/controller/serde";
import {SerdeSystem} from "@leela/common";

const serde = new SerdeSystem();
initSerde(serde);

const network = new NetworkSystem(serde);
network.init();

const world = new World();

new Controller(network, world);
