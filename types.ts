import type { Message } from "./client/src/types";

export type WSMessage =
  | { type: "auth"; token: string }
  | {
      type: "join_room" | "message";
      roomId: number;
      token?: string;
      content?: string | Message;
    };
