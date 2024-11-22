import WorldSocket from "./WorldSocket";
import Loop from "./utils/Loop";
import { Opcode } from "../protocol/Opcode";
import WorldClientConfig from "./WorldClientConfig";
import WorldPacket from "../protocol/WorldPacket";
import OpcodeTable from "./OpcodeTable";
import Codec from "../protocol/Codec";
import WorldSessionState from "./WorldSessionState";

export default class WorldSession {

  private _socket: null | WorldSocket;
  public readonly config: WorldClientConfig;

  private readonly opcodeTable: OpcodeTable;

  private cmdLoop: Loop;
  private simulationLoop: Loop;

  public readonly state: WorldSessionState;

  private readonly pingInterval: number;

  private _pingStart: null | number;
  public latency: number;
  private _tick: number;

  constructor(socket: WorldSocket) {
    this._socket = socket;
    this.config = socket.config;

    this.opcodeTable = new OpcodeTable(this._socket.scene);

    this.state = new WorldSessionState(this);

    this._pingStart = null;
    this.latency = -1;
    this._tick = -1;

    this.sendPacket([Opcode.CMSG_UPDATE_RATE, this.config.clientUpdateRate]);

    this.cmdLoop = this.initCmdLoop();
    this.simulationLoop = this.initSimulationLoop();

    this.pingInterval = this.startPing();
  }

  public sendObject<T>(opcode: Opcode, object: T) {
    this.sendPacket(Codec.encode(opcode, object));
  }

  public sendPacket(packet: WorldPacket): void {
    this._socket!.sendPacket(packet, !this.config.clientCmdLoop);
  }

  public recvPacket(packet: WorldPacket): void {
    const opcode = packet[0] as Opcode;

    const handler = this.opcodeTable.getHandler(opcode);

    handler.handle(this, packet);
  }

  private initCmdLoop() {
    const cmdLoop= new Loop();

    cmdLoop.start(
      () => this._socket!.sendBufferedPackets(),
      this.config.clientCmdRate < 0 ? this.config.simulationRate : this.config.clientCmdRate
    );

    return cmdLoop;
  }

  private initSimulationLoop() {
    const simulationLoop= new Loop();

    simulationLoop.start(
      (delta: number) => this.simulate(delta),
      this.config.simulationRate
    );

    return simulationLoop;
  }

  private simulate(delta: number): void {
    this._tick = ++this._tick % this.config.tickCap;
    this._socket!.scene.simulate(delta);
  }

  private startPing() {
    return setInterval(() => {
      this._pingStart = Date.now();

      this._socket!.sendPacket([Opcode.CMSG_PING, this.latency], true);
    }, this.config.pingIntervalMs) as unknown as number;
  }

  public destroy(): void {
    this.state.destroy();

    this._socket = null;

    this.cmdLoop.stop();
    this.simulationLoop.stop();

    clearInterval(this.pingInterval);
    this._pingStart = null;
    this.latency = -1;
  }

  public get scene() {
    return this._socket?.scene;
  }

  public get socket() {
    return this._socket;
  }

  public get tick(): number {
    return this._tick;
  }

  public get pingStart() {
    return this._pingStart;
  }
}
