import RoomManager from "./roomsManager";
import ConnectionsManager from "./connectionsManager";
import WebSocket from "ws";
import type { WSMessage } from "../../types";
import MessageService from "../services/messageService";
import jwt from "jsonwebtoken";
import { AuthedWebSocket } from "./types";

class MessageHandler {
  static async handleMessage(ws: AuthedWebSocket, data: string) {
    const message: WSMessage = JSON.parse(data);

    if (message.type !== "auth" && !ws.isAuthenticated) {
      ws.send(JSON.stringify({ type: "error", content: "Unauthorized" }));
      ws.close();
      return;
    }

    switch (message.type) {
      case "auth": {
        try {
          const decoded = jwt.verify(
            message.token || "",
            `${process.env.JWT_SECRET}`,
          ) as { userId: number };

          ws.user = { id: decoded.userId };
          ws.isAuthenticated = true;
        } catch {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid token",
            }),
          );
          ws.close();
        }

        break;
      }
      case "join_room":
        RoomManager.joinRoom(message.roomId, ws.user.id);
        ConnectionsManager.addClient(ws);

        break;

      case "leave_room":
        RoomManager.leaveRoom(message.roomId, ws.user.id);
        ConnectionsManager.removeClient(ws.user.id);

        break;

      case "message":
        try {
          await MessageService.createMessage({
            userId: ws.user.id,
            userName: message.userName as string,
            roomId: message.roomId,
            content: message.content as string,
          });
        } catch (error) {
          console.log("Error handling message: ", error);
        }

        break;
    }
  }
}

export default MessageHandler;
