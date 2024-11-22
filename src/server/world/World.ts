import WorldServer from "../WorldServer";
import WorldSession from "../WorldSession";
import Loop from "../utils/Loop";
import WorldServerConfig from "../WorldServerConfig";
import GameObjectManager from "../../core/GameObjectManager";
import WorldGameObject from "../core/WorldGameObject";

export default class World {

    public readonly server: WorldServer;
    public readonly config: WorldServerConfig;
    public readonly loop: Loop;

    public readonly sessions: Map<string, WorldSession>;

    public readonly objects: GameObjectManager;

    constructor(server: WorldServer) {
        this.server = server;
        this.config = server.config;
        this.loop = new Loop();

        this.sessions = new Map();

        this.objects = new GameObjectManager();

        this.loop.start(delta => this.update(delta), this.config.simulationRate);
    }

    public addSession(session: WorldSession): void {
        this.sessions.set(session.socket.id, session);
    }

    public removeSession(session: WorldSession): void {
        this.sessions.delete(session.socket.id);
    }

    public update(delta: number): void {
        this.applyClientUpdates(delta);

        this.objects.update(delta);
    }

    private applyClientUpdates(delta: number) {
        this.forEachSession(session => session.handleQueuedPackets(delta));
    }

    public forEachSession(callback: (session: WorldSession) => void) {
        for(const session of this.sessions.values()) {
            callback(session);
        }
    }

    public collectSessionUpdate(session: WorldSession, delta: number): void {

    }

    public createObject(): WorldGameObject {
        const gameObject = new WorldGameObject(this);

        this.objects.add(gameObject);

        return gameObject;
    }
}
