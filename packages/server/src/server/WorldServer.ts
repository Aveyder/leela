import express, {Express} from "express";
import cors from "cors";
import http from "http";
import {PORT} from "../config";
import * as io from "socket.io";
import World from "../world/World";
import WorldSocket from "./WorldSocket";
import msgpack from "socket.io-msgpack-parser";

export default class WorldServer {

    public readonly world: World;

    private _express: Express;
    private _http: http.Server;
    private _io: io.Server;

    constructor(world: World) {
        this.world = world;
    }

    public init() {
        this.initExpressApp();
        this.initHttpServer();
        this.initIOServer();
        this.initWorldSocketManagement();
    }

    private initExpressApp() {
        this._express = express();

        this._express.use(cors());

        this._express.get("/", (req, res) => {
            res.send(`<h1>Leela Server</h1>`);
        });
    }

    private initHttpServer(): void {
        this._http = http.createServer(this._express);

        this._http.listen(PORT, () => {
            console.log(`HTTP: listening on *:${PORT}`);
        });
    }

    private initIOServer(): void {
        this._io = new io.Server(this._http, {
            cors: {
                origin: "*"
            },
            parser: msgpack
        });
    }

    private initWorldSocketManagement() {
        this._io.on("connection", socket => {
            console.log(`user connected: ${socket.id}`);

            const worldSocket = new WorldSocket(this.world, socket);
            worldSocket.init();
        });
    }

    public get express() {
        return this._express;
    }

    public get http() {
        return this._http;
    }

    public get io() {
        return this._io;
    }
}
