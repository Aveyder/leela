export default class WorldServerConfig {
  public readonly serverPort!: number;
  public readonly serverUpdateRate!: number;
  public readonly simulationRate!: number;
  public readonly msgpackEnabled!: boolean;
  public readonly charSpeed!: number;

  public static fromEnv(): WorldServerConfig {
    return {
      serverPort: Number(process.env.SERVER_PORT),
      serverUpdateRate: Number(process.env.SERVER_UPDATE_RATE),
      simulationRate: Number(process.env.SIMULATION_RATE),
      msgpackEnabled: process.env.MSGPACK_ENABLED === 'true',
      charSpeed: Number(process.env.CHAR_SPEED),
    };
  }
}
