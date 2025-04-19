import WorldSocket from "./WorldSocket";
import Loop from "./utils/Loop";
import { Opcode } from "../protocol/Opcode";
import WorldClientConfig from "./WorldClientConfig";
import WorldPacket from "../protocol/WorldPacket";
import OpcodeTable from "./OpcodeTable";
import Codec from "../protocol/Codec";
import WorldSessionScope from "./WorldSessionScope";
import { Game } from "phaser";

export default class WorldSession {

  public readonly socket: WorldSocket;
  public readonly config: WorldClientConfig;

  public game!: Game;

  public readonly serverStartTime: number;

  private _pingStart: null | number;
  public latency: number;
  private _tick: number;

  private ready: boolean;
  public scope!: WorldSessionScope;

  private opcodeTable?: OpcodeTable;

  private cmdLoop?: Loop;
  private simulationLoop?: Loop;

  private pingInterval?: number;

  constructor(socket: WorldSocket, serverStartTime: number) {
    this.socket = socket;
    this.config = socket.config;

    this.serverStartTime = serverStartTime;

    this._pingStart = null;
    this.latency = -1;
    this._tick = -1;

    this.ready = false;
  }

  public init(game: Game): void {
    this.game = game;

    this.scope = new WorldSessionScope(this);

    this.opcodeTable = new OpcodeTable(this);

    this.sendPacket([Opcode.CMSG_UPDATE_RATE, this.config.clientUpdateRate]);

    this.cmdLoop = this.initCmdLoop();
    this.simulationLoop = this.initSimulationLoop();

    this.pingInterval = this.startPing();

    this.ready = true;
  }

  public sendObject<T>(opcode: Opcode, object: T): void {
    this.sendPacket(Codec.encode(opcode, object));
  }

  public sendPacket(packet: WorldPacket): void {
    this.socket.sendPacket(packet, !this.config.clientCmdLoop);
  }

  public recvPacket(packet: WorldPacket): void {
    if (!this.ready) return;

    const opcode = packet[0] as Opcode;

    const handler = this.opcodeTable!.getHandler(opcode);

    handler.handle(packet);
  }

  private initCmdLoop(): Loop {
    const cmdLoop= new Loop();

    cmdLoop.start(
      () => this.socket.sendBufferedPackets(),
      this.config.clientCmdRate < 0 ? this.config.simulationRate : this.config.clientCmdRate
    );

    return cmdLoop;
  }

  private initSimulationLoop(): Loop {
    const simulationLoop= new Loop();

    simulationLoop.start(
      (delta: number) => this.simulate(delta),
      this.config.simulationRate
    );

    return simulationLoop;
  }

  private simulate(delta: number): void {
    this._tick = ++this._tick % this.config.tickCap;

    this.scope!.simulate(delta);
  }

  private startPing(): number {
    return setInterval(() => {
      this._pingStart = Date.now();

      this.socket.sendPacket([Opcode.CMSG_PING, this.latency], true);
    }, this.config.pingIntervalMs) as unknown as number;
  }

  public destroy(): void {
    this.scope?.destroy();

    this.cmdLoop?.stop();
    this.simulationLoop?.stop();

    clearInterval(this.pingInterval);
    this._pingStart = null;
    this.latency = -1;
  }

  public getServerTimestamp(timestamp: number) {
    return this.serverStartTime + timestamp;
  }

  public get tick() {
    return this._tick;
  }

  public get pingStart() {
    return this._pingStart;
  }
}
