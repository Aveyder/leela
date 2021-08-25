import NetworkSystem from "./network/NetworkSystem";
import World from "./world/World";

const network = new NetworkSystem();
network.init();

const world = new World(network);
world.init();
