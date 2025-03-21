import WorldServer from "../WorldServer";
import WorldSession from "../WorldSession";
import Loop from "../utils/Loop";
import WorldServerConfig from "../WorldServerConfig";
import WorldPacket from "../../protocol/WorldPacket";
import { Opcode } from "../../protocol/Opcode";
import Codec from "../../protocol/Codec";
import WorldGameObjectManager from "../core/WorldGameObjectManager";
import Matter, { World as MatterWorld } from "matter-js";
import CaltheraMap from '../../assets/map/calthera.json';
import * as matterUtils from "../../utils/matter";

export default class World {

    public readonly server: WorldServer;
    public readonly config: WorldServerConfig;
    public readonly loop: Loop;
    public readonly sessions: Map<string, WorldSession>;
    public readonly objects: WorldGameObjectManager;

    public readonly matterEngine: Matter.Engine;

    constructor(server: WorldServer) {
        this.server = server;
        this.config = server.config;
        this.loop = new Loop();
        this.sessions = new Map();
        this.objects = new WorldGameObjectManager(this);

        this.matterEngine = Matter.Engine.create({
            gravity: {x: 0, y: 0}
        });

        matterUtils.createBodiesFromObjectGroups(CaltheraMap).forEach(body => {
            body.label = 'wall';
            MatterWorld.add(this.matterEngine.world, body);
        });

        Matter.Events.on(this.matterEngine, "collisionStart", (event) => {
            event.pairs.forEach((pair) => {
                console.log("Collision started between:", pair.bodyA.label, "and", pair.bodyB.label);
            });
        });

        this.loop.start(delta => this.update(delta), this.config.simulationRate);
    }

    public addSession(session: WorldSession): void {
        this.sessions.set(session.socket.id, session);
    }

    public removeSession(session: WorldSession): void {
        this.sessions.delete(session.socket.id);
    }

    public broadcastObject<T>(opcode: Opcode, object: T): void {
        this.broadcast(Codec.encode(opcode, object));
    }

    public broadcast(packet: WorldPacket): void {
        this.forEachSession(session => session.sendPacket(packet));
    }

    public update(delta: number): void {
        this.applyClientUpdates(delta);

        this.objects.update(delta);

        Matter.Engine.update(this.matterEngine, delta * 1000);
    }

    private applyClientUpdates(delta: number) {
        this.forEachSession(session => session.handleQueuedPackets(delta));
    }

    public forEachSession(callback: (session: WorldSession) => void) {
        for(const session of this.sessions.values()) {
            callback(session);
        }
    }
}
