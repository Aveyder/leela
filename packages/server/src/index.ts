import NetworkSystem from "./network/NetworkSystem";
import World from "./game/world/World";
import Controller from "./game/controller/Controller";

const network = new NetworkSystem();
network.init();

const world = new World();

new Controller(network, world);
