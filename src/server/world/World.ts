import WorldServer from "../WorldServer";
import WorldSession from "../WorldSession";
import Loop from "../utils/Loop";
import WorldServerConfig from "../WorldServerConfig";
import WorldPacket from "../../protocol/WorldPacket";
import { Opcode } from "../../protocol/Opcode";
import Codec from "../../protocol/Codec";
import WorldGameObjectManager from "../core/WorldGameObjectManager";
import Matter, { Bodies, World as MatterWorld } from "matter-js";
import CaltheraMap from '../../assets/map/calthera.json';

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

        const objectMap = new Map();
        for (const tileset of CaltheraMap.tilesets) {
            const tiles = tileset.tiles;
            if (tiles) {
                for (const tile of tileset.tiles) {
                    if (tile.objectgroup) {
                        objectMap.set(tile.id, tile.objectgroup.objects)
                    }
                }
            }
        }

        const tilewidth = CaltheraMap.tilewidth;
        const tileheight = CaltheraMap.tileheight;

        for(const layer of CaltheraMap.layers) {
            const chunks = layer.chunks;

            if (chunks) {
                for(const chunk of chunks) {
                    for (let i = 0; i < chunk.height; i++) {
                        for(let j = 0; j < chunk.width; j++) {
                            const tileId = chunk.data[i * chunk.width + j];

                            const objects = objectMap.get(tileId);
                            if (objects) {
                                const tileX = (layer.x + chunk.x + j) * tilewidth;
                                const tileY = (layer.y + chunk.y + i) * tileheight;

                                for (const object of objects) {
                                    const body = Bodies.rectangle(tileX + object.x, tileY + object.y, object.width, object.height, {
                                        isStatic: true
                                    });

                                    MatterWorld.add(this.matterEngine.world, body);
                                }
                            }
                        }
                    }
                }
            }
        }

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
