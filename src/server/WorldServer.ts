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
    public readonly express: Express;
    public readonly http: http.Server;
    public readonly io: io.Server;
    public readonly world: World;
    public readonly sockets: Record<string, WorldSocket>;
    public readonly startTime: number;

    constructor(config: WorldServerConfig) {
        this.config = config;

        this.express = this.initExpressApp();
        this.http = this.initHttpServer();
        this.io = this.initIOServer();

        this.world = new World(this);

        this.sockets = {};

        this.startTime = Date.now();

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
        this.io.on("connection", io => {
            const socket =  new WorldSocket(this, io)

            this.sockets[socket.id] = socket;

            io.on("disconnect", () => {
                socket.destroy();

                io.removeAllListeners("disconnect");

                delete this.sockets[socket.id];
            });
        });
    }

    public getTimestamp(): number {
        return Date.now() - this.startTime;
    }
}
