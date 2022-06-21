import express, {Express} from "express";
import cors from "cors";
import http from "http";
import {PORT} from "../constants/config";
import timesyncServer from "timesync/server";
import * as io from "socket.io";
import World from "../world/World";
import OpcodeTable from "./protocol/OpcodeTable";
import WorldSocket from "./WorldSocket";

export default class WorldServer {

    public readonly world: World;

    private _express: Express;
    private _http: http.Server;
    private _io: io.Server;

    private opcodeTable: OpcodeTable;

    constructor(world: World) {
        this.world = world;
    }

    public init() {
        this.initExpressApp();
        this.initTimesyncEndpoint();
        this.initHttpServer();
        this.initIOServer();
        this.initOpcodeTable();
        this.initWorldSocketManagement();
    }

    private initExpressApp() {
        this._express = express();

        this._express.use(cors());

        this._express.get("/", (req, res) => {
            res.send(`<h1>Leela Server</h1>`);
        });
    }

    public get express() {
        return this._express;
    }

    private initTimesyncEndpoint(): void {
        this._express.use("/timesync", timesyncServer.requestHandler);
    }

    private initHttpServer(): void {
        this._http = http.createServer(this._express);

        this._http.listen(PORT, () => {
            console.log(`HTTP: listening on *:${PORT}`);
        });
    }

    public get http() {
        return this._http;
    }

    private initIOServer(): void {
        this._io = new io.Server(this._http, {
            cors: {
                origin: "*"
            }
        });
    }

    public get io() {
        return this._io;
    }

    private initOpcodeTable() {
        this.opcodeTable = new OpcodeTable();

        this.opcodeTable.init();
    }

    private initWorldSocketManagement() {
        this.io.on("connection", socket => {
            console.log(`user connected: ${socket.id}`);

            const worldSocket = new WorldSocket(this.world, this.opcodeTable, socket);

            worldSocket.init();
        });
    }
}
