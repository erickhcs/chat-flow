import type { Message } from "./client/src/types";

export type WSMessage = {
  type: "join_room" | "message";
  roomId: number;
  userId: number;
  content?: string | Message;
};
