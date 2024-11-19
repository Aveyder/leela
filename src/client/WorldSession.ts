import WorldSocket from "./WorldSocket";
import Loop from "./utils/Loop";
import { Opcode } from "../protocol/Opcode";
import WorldClientConfig from "./WorldClientConfig";
import WorldPacket from "../protocol/WorldPacket";
import OpcodeTable from "./OpcodeTable";
import Codec from "../protocol/Codec";

export default class WorldSession {

  private _socket: null | WorldSocket;
  public readonly config: WorldClientConfig;

  private cmdLoop: Loop;

  private _pingStart: null | number;
  private pingInterval: number;
  public latency: number;

  constructor(socket: WorldSocket) {
    this._socket = socket;
    this.config = socket.config;

    this._pingStart = null;

    this.latency = -1;

    this.sendPacket([Opcode.CMSG_UPDATE_RATE, this.config.clientUpdateRate]);

    this.cmdLoop = this.initCmdLoop();
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

    const handler = OpcodeTable.getHandler(opcode);

    handler(this, packet);
  }

  private initCmdLoop() {
    const cmdLoop= new Loop();

    cmdLoop.start(
      () => this._socket!.sendBufferedPackets(),
      this.config.clientCmdRate < 0 ? this.config.simulationRate : this.config.clientCmdRate
    );

    return cmdLoop;
  }

  private startPing() {
    return setInterval(() => {
      this._pingStart = Date.now();

      this._socket!.sendPacket([Opcode.CMSG_PING, this.latency], true);
    }, this.config.pingIntervalMs) as unknown as number;
  }

  public destroy(): void {
    this._socket = null;

    this.cmdLoop.stop();

    clearInterval(this.pingInterval);
    this._pingStart = null;
    this.latency = -1;

    // removePlayerFromWorldSession(this);
  }

  public get scene() {
    return this._socket?.scene;
  }

  public get socket() {
    return this._socket;
  }

  public get pingStart() {
    return this._pingStart;
  }
}
