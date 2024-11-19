import WorldServer from "../WorldServer";
import WorldSession from "../WorldSession";
import Loop from "../utils/Loop";
import WorldServerConfig from "../WorldServerConfig";

export default class World {

    public readonly server: WorldServer;
    public readonly config: WorldServerConfig;
    public readonly loop: Loop;

    public readonly sessions: Record<string, WorldSession>;

    constructor(server: WorldServer) {
        this.server = server;
        this.config = server.config;
        this.loop = new Loop();

        this.sessions = {};

        this.loop.start(delta => this.update(delta), this.config.simulationRate);
    }

    public addSession(session: WorldSession): void {
        this.sessions[session.socket.id] = session;
    }

    public removeSession(session: WorldSession): void {
        delete this.sessions[session.socket.id];
    }

    public update(delta: number): void {
        this.applyClientUpdates(delta);
    }

    private applyClientUpdates(delta: number) {
        this.forEachSession(session => session.handleQueuedPackets(delta));
    }

    public forEachSession(callback: (session: WorldSession) => void) {
        Object.values(this.sessions).forEach(session => callback(session));
    }

    public collectSessionUpdate(session: WorldSession, delta: number): void {

    }
}
