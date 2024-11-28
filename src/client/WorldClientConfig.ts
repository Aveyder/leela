export default class WorldClientConfig {
  public readonly serverUrl!: string;
  public readonly timesyncIntervalMs!: number;
  public readonly clientUpdateRate!: number;
  public readonly clientCmdLoop!: boolean;
  public readonly clientCmdRate!: number;
  public readonly simulationRate!: number;
  public readonly pingIntervalMs!: number;
  public readonly msgpackEnabled!: boolean;
  public readonly tickCap!: number;
  public readonly charSpeed!: number;
  public readonly clientStateBufferSize!: number;
  public readonly interpolationMs!: number;
  public readonly extrapolateEntity!: boolean;
  public readonly extrapolateEntityMaxMs!: number;

  public static fromEnv(): WorldClientConfig {
    return {
      serverUrl: `${process.env.SERVER_PROTO}://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`,
      timesyncIntervalMs: Number(process.env.TIMESYNC_INTERVAL_MS),
      clientUpdateRate: Number(process.env.CLIENT_UPDATE_RATE),
      clientCmdLoop: process.env.CLIENT_CMD_LOOP === 'true',
      clientCmdRate: Number(process.env.CLIENT_CMD_RATE),
      simulationRate: Number(process.env.SIMULATION_RATE),
      pingIntervalMs: Number(process.env.PING_INTERVAL_MS),
      msgpackEnabled: process.env.MSGPACK_ENABLED === 'true',
      tickCap: Number(process.env.TICK_CAP),
      charSpeed: Number(process.env.CHAR_SPEED),
      clientStateBufferSize: Number(process.env.CLIENT_STATE_BUFFER_SIZE),
      interpolationMs: Number(process.env.INTERPOLATION_MS),
      extrapolateEntity: process.env.EXTRAPOLATE_ENTITY === 'true',
      extrapolateEntityMaxMs: Number(process.env.EXTRAPOLATE_ENTITY_MAX_MS),
    };
  }
}
