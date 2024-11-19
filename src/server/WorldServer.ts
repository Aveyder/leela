import express, { Express } from "express";
import cors from "cors";
import http from "http";
import * as io from "socket.io";
import WorldSocket from "./WorldSocket";
import msgpack from "socket.io-msgpack-parser";
import WorldServerConfig from "./WorldServerConfig";
import World from "./world/World";

export default class WorldServer {

    public readonly config: WorldServerConfig;
    public readonly world: World;
    public readonly express: Express;
    public readonly http: http.Server;
    public readonly io: io.Server;

    constructor(config: WorldServerConfig) {
        this.config = config;

        this.express = this.initExpressApp();
        this.http = this.initHttpServer();
        this.io = this.initIOServer();

        this.world = new World(this);

        this.initWorldSocketManagement();
    }

    private initExpressApp() {
        const expressApp = express();

        expressApp.use(cors());

        expressApp.get("/", (req, res) => {
            res.send(`<h1>Leela Server</h1>`);
        });

        return expressApp;
    }

    private initHttpServer() {
        const httpServer = http.createServer(this.express);

        httpServer.listen(this.config.serverPort, () => {
            console.log(`HTTP: listening on *:${this.config.serverPort}`);
        });

        return httpServer;
    }

    private initIOServer() {
        const opts = {
            cors: {
                origin: "*"
            }
        } as Partial<io.ServerOptions>;

        if (this.config.msgpackEnabled) {
            opts.parser = msgpack;
        }

        return new io.Server(this.http, opts);
    }

    private initWorldSocketManagement() {
        this.io.on("connection", socket => {
            console.log(`user connected: ${socket.id}`);

            new WorldSocket(this, socket);
        });
    }
}
