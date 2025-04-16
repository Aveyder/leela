import WorldServer from "../WorldServer";
import WorldSession from "../WorldSession";
import Loop from "../utils/Loop";
import WorldServerConfig from "../WorldServerConfig";
import WorldPacket from "../../protocol/WorldPacket";
import { Opcode } from "../../protocol/Opcode";
import Codec from "../../protocol/Codec";
import WorldGameObjectManager from "../core/WorldGameObjectManager";
import CaltheraMap from '../../assets/map/calthera.json';
import * as tiledUtils from "../utils/tiled";
import PhysicsBodyComponent from "../core/PhysicsBodyComponent";
import PhysicsWorld from "../../shared/physics/World";

export default class World {

    public readonly server: WorldServer;
    public readonly config: WorldServerConfig;
    public readonly loop: Loop;
    public readonly sessions: Map<string, WorldSession>;
    public readonly objects: WorldGameObjectManager;

    public readonly physicsWorld: PhysicsWorld;

    constructor(server: WorldServer) {
        this.server = server;
        this.config = server.config;
        this.loop = new Loop();
        this.sessions = new Map();
        this.objects = new WorldGameObjectManager(this);

        this.physicsWorld = new PhysicsWorld();

        tiledUtils.createBodiesFromObjectGroups(CaltheraMap).forEach(body => this.physicsWorld.add(body));

        this.loop.start(delta => this.update(delta), this.config.simulationRate);

        // for(let i = 0; i < 100; i++) {
        //     const npc = new NPC(this, this.objects.guid());
        //
        //     npc.x = Math.random() * 600 + 100;
        //     npc.y = Math.random() * 600 + 100;
        //
        //     const randomModel = Math.floor(MODELS.length * Math.random());
        //     npc.getComponent(ModelComponent).setModel(MODELS[randomModel]);
        //
        //     this.objects.add(npc);
        // }
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

        this.physicsWorld.step();

        this.objects.forEach(gameObject =>
          gameObject.getComponent(PhysicsBodyComponent)?.syncGameObjectPosition()
        );

        this.objects.captureState();
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
