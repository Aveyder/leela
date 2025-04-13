import WorldServer from "../WorldServer";
import WorldSession from "../WorldSession";
import Loop from "../utils/Loop";
import WorldServerConfig from "../WorldServerConfig";
import WorldPacket from "../../protocol/WorldPacket";
import { Opcode } from "../../protocol/Opcode";
import Codec from "../../protocol/Codec";
import WorldGameObjectManager from "../core/WorldGameObjectManager";
import Matter, { Bodies, Body, World as MatterWorld } from "matter-js";
import CaltheraMap from '../../assets/map/calthera.json';
import * as matterUtils from "../utils/matter";
import MatterBodyComponent from "../core/MatterBodyComponent";
import NPC from "../core/NPC";
import ModelComponent from "../core/ModelComponent";
import { MODELS } from "../../resource/Model";

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

        MatterWorld.add(this.matterEngine.world, Body.create({
            parts: matterUtils.createBodiesFromObjectGroups(CaltheraMap),
            isStatic: true
        }));

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

        // TODO: move this responsibility into a separate service/component called 'Physics/Matter'
        Matter.Engine.update(this.matterEngine, delta * 1000);

        this.objects.forEach(gameObject =>
          gameObject.getComponent(MatterBodyComponent)?.syncGameObjectPosition()
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
