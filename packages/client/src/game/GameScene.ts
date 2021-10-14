import NetworkSystem from "../network/NetworkSystem";
import PreloaderSystem from "./preload/PreloaderSystem";

export default class GameScene extends Phaser.Scene {

    public network: NetworkSystem;

    constructor() {
        super("game");
    }

    preload(): void {
        const preloader = new PreloaderSystem(this);
        preloader.preload();
    }

    create(network: NetworkSystem): void {
        this.network = network;
    }
}
