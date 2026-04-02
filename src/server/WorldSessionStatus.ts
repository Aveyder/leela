export const WorldSessionStatus = {
  STATUS_NEVER: 0,
  STATUS_AUTHED: 1,
  STATUS_JOINED: 2,
} as const;
export type WorldSessionStatus = typeof WorldSessionStatus[keyof typeof WorldSessionStatus];
