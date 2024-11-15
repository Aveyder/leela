declare module "timesync" {
    import {Socket} from "socket.io-client";
    type TimeSync = {
    destroy();
    now(): number;
    on(event: "change", callback: (offset: number) => void);
    on(event: "error", callback: (err: unknown) => void);
    on(event: "sync", callback: (value: "start" | "end") => void);
    off(event: "change" | "error" | "sync", callback?: () => void);
    sync();

    send(to: string | Socket, data: unknown, timeout: number): Promise<void>;
    receive(from: string, data: unknown);
  };

  type TimeSyncCreateOptions = {
    interval?: number;
    timeout?: number;
    delay?: number;
    repeat?: number;
    peers?: string | string[];
    server?: string | Socket;
    now?: () => number;
  };

  function create(options: TimeSyncCreateOptions): TimeSync;
}
