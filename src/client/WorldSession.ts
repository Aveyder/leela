import Loop from "./utils/Loop";
import { Opcode } from "../protocol/Opcode";
import WorldPacket from "../protocol/WorldPacket";
import OpcodeTable from "./OpcodeTable";
import Codec from "../protocol/Codec";
import WorldSessionScope from "./WorldSessionScope";
import GameContext from "./GameContext";

export default class WorldSession {

  private readonly context: GameContext;

  public readonly serverStartTime: number;

  private _pingStart: null | number;
  public latency: number;
  private _tick: number;

  public accept: boolean;
  private scope: WorldSessionScope;

  private opcodeTable: OpcodeTable;

  private cmdLoop: Loop;
  private simulationLoop: Loop;

  private pingInterval: number;

  constructor(context: GameContext, serverStartTime: number) {
    this.context = context;
    this.serverStartTime = serverStartTime;

    this._pingStart = null;
    this.latency = -1;
    this._tick = -1;

    this.accept = false;
  }

  public init(): void {
    this.scope = new WorldSessionScope(this.context);

    this.opcodeTable = new OpcodeTable(this.context);

    this.sendPacket([Opcode.CMSG_UPDATE_RATE, this.context.config.clientUpdateRate]);

    this.cmdLoop = this.initCmdLoop();
    this.simulationLoop = this.initSimulationLoop();

    this.pingInterval = this.startPing();
  }

  public sendObject<T>(opcode: Opcode, object: T): void {
    this.sendPacket(Codec.encode(opcode, object));
  }

  public sendPacket(packet: WorldPacket): void {
    this.context.socket.sendPacket(packet, !this.context.config.clientCmdLoop);
  }

  public recvPacket(packet: WorldPacket): void {
    if (!this.accept) return;

    const opcode = packet[0] as Opcode;

    const handler = this.opcodeTable.getHandler(opcode);

    handler.handle(packet);
  }

  private initCmdLoop(): Loop {
    const cmdLoop= new Loop();

    cmdLoop.start(
      () => this.context.socket.sendBufferedPackets(),
      this.context.config.clientCmdRate < 0 ? this.context.config.simulationRate : this.context.config.clientCmdRate
    );

    return cmdLoop;
  }

  private initSimulationLoop(): Loop {
    const simulationLoop= new Loop();

    simulationLoop.start(
      (delta: number) => this.simulate(delta),
      this.context.config.simulationRate
    );

    return simulationLoop;
  }

  private simulate(delta: number): void {
    this._tick = ++this._tick % this.context.config.tickCap;

    this.scope.simulate(delta);
  }

  private startPing(): number {
    return setInterval(() => {
      this._pingStart = Date.now();

      this.context.socket.sendPacket([Opcode.CMSG_PING, this.latency], true);
    }, this.context.config.pingIntervalMs) as unknown as number;
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
