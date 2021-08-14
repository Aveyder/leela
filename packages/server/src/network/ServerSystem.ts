import {Server} from "socket.io";
import * as http from "http";
import express, {Express} from "express";
import cors from "cors";
import {PORT} from "../constants/config";

export default class ServerSystem {

    public app: Express;
    public server: http.Server;
    public io: Server;

    public bootstrap(): void {
        this.bootstrapAppServer();
        this.bootstrapHttpServer();
        this.bootstrapSocketServer();
    }

    private bootstrapAppServer(): void {
        const app = express();

        app.use(cors());

        app.get("/", (req, res) => {
            res.send(`<h1>Leela Server</h1>`);
        });

        this.app = app;
    }

    private bootstrapHttpServer(): void {
        const server = http.createServer(this.app);

        server.listen(PORT, () => {
            console.log(`listening on *:${PORT}`);
        });

        this.server = server;
    }

    private bootstrapSocketServer(): void {
        this.io = new Server(this.server, {
            cors: {
                origin: "*"
            }
        });
    }
}
