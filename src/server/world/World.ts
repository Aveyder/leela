import WorldServer from "../WorldServer";
import WorldSession from "../WorldSession";

export default class World {

    public readonly server: WorldServer;

    constructor(server: WorldServer) {
        this.server = server;
    }

    public addSession(session: WorldSession): void {

    }

    public removeSession(session: WorldSession): void {

    }
}
