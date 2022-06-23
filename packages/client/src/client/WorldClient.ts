import WorldScene from "../world/WorldScene";
import {io, Socket} from "socket.io-client";
import {SERVER_HOST, TIMESYNC_INTERVAL_MS} from "../config";
import OpcodeTable from "./protocol/OpcodeTable";
import * as timesync from "timesync";
import {TimeSync} from "timesync";
import WorldSocket from "./WorldSocket";


export default class WorldClient {

    private readonly worldScene: WorldScene;

    private socket: Socket;
    private _ts: TimeSync;

    private opcodeTable: OpcodeTable;

    constructor(worldScene: WorldScene) {
        this.worldScene = worldScene;
    }

    public init(): void {
        this.initTimesyncClient();
        this.initOpcodeTable();
        this.initIOSocket();
    }

    private initTimesyncClient() {
        this._ts = timesync.create({
            server: `${SERVER_HOST}/timesync`,
            interval: TIMESYNC_INTERVAL_MS
        });
    }

    public get ts() {
        return this._ts;
    }

    private initOpcodeTable() {
        this.opcodeTable = new OpcodeTable();
        this.opcodeTable.init();
    }

    private initIOSocket() {
        this.socket = io(SERVER_HOST);

        this.socket.on("connect", () => {
            const worldSocket = new WorldSocket(this.worldScene, this.opcodeTable, this.socket);

            worldSocket.init();
        });
    }
}
