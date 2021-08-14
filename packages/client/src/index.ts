import "phaser";
import "../scss/styles.scss";
import NetworkSystem from "./network/NetworkSystem";

const network = new NetworkSystem();
network.init();
