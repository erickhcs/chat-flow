import type { Message } from "./client/src/types";

export type WSMessage =
  | { type: "auth"; token: string }
  | {
      type: "join_room" | "leave_room";
      roomId: number;
    }
  | {
      type: "message";
      roomId: number;
      content: string | Message;
      userName: string;
    };
