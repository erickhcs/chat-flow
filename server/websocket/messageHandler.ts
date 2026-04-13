import RoomManager from "./roomsManager";
import ConnectionsManager from "./connectionsManager";
import WebSocket from "ws";
import type { WSMessage } from "../../types";
import MessageService from "../services/messageService";

let roomId = 1;

class MessageHandler {
  static async handleMessage(ws: WebSocket, data: string) {
    const message: WSMessage = JSON.parse(data);

    switch (message.type) {
      case "join_room":
        RoomManager.joinRoom(roomId, message.userId);
        ConnectionsManager.addClient(message.userId, ws);

        break;

      case "message":
        try {
          const usersInRoom = RoomManager.getUsersInRoom(message.roomId);
          const createdMessage = await MessageService.createMessage({
            userId: message.userId,
            roomId: message.roomId,
            content: message.content as string,
          });

          usersInRoom.forEach((userId) => {
            const client = ConnectionsManager.getClient(userId);
            console.log("Client to send message: ", client, userId);
            if (client?.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "message",
                  content: createdMessage,
                  roomId: message.roomId,
                }),
              );
            }
          });
        } catch (error) {
          console.log("Error handling message: ", error);
        }

        break;
    }
  }
}

export default MessageHandler;
