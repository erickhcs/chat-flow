import type { Message } from "@/types";
import type { WSMessage } from "../../../types";

type MessageHandler = (message: Message) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private pendingMessages: string[] = [];
  private reconnectTimeout: number | null = null;
  private retryCount = 0;
  private messageHandler?: MessageHandler;
  private joinedRooms: Set<number> = new Set();
  private isManuallyClosed = false;

  public connect(
    messageHandler: MessageHandler,
    url = import.meta.env.VITE_WS_URL,
  ) {
    this.isManuallyClosed = false;
    this.messageHandler = messageHandler;
    this.socket = new WebSocket(url);
    this.socket.addEventListener("message", (event) => {
      return this.handleMessage(event, messageHandler);
    });
    this.socket.addEventListener("open", this.handleOpen);
    this.socket.addEventListener("close", this.handleClose);

    this.joinedRooms.forEach((roomId) => {
      this.joinRoom(roomId);
    });
  }

  public joinRoom(roomId: number) {
    this.joinedRooms.add(roomId);

    const message: WSMessage = {
      type: "join_room",
      roomId,
    };

    this.sendWhenOpen(message);
  }

  private handleOpen = () => {
    this.retryCount = 0;

    const token = localStorage.getItem("token") || "";

    const authMessage: WSMessage = {
      type: "auth",
      token: token,
    };

    this.sendWhenOpen(authMessage);

    if (this.pendingMessages.length === 0) {
      return;
    }

    for (const pendingMessage of this.pendingMessages) {
      this.socket?.send(pendingMessage);
    }

    this.pendingMessages = [];
  };

  private handleClose = () => {
    if (this.isManuallyClosed) {
      return;
    }

    const delay = Math.min(1000 * 2 ** this.retryCount, 10000);

    this.reconnectTimeout = setTimeout(() => {
      this.retryCount++;
      this.connect(this.messageHandler as MessageHandler);
    }, delay);
  };

  private handleMessage = (
    event: MessageEvent,
    onReceiveMessage: (message: Message) => void,
  ) => {
    try {
      const message: WSMessage = JSON.parse(event.data);

      switch (message.type) {
        case "message":
          onReceiveMessage(message.content as Message);
          break;
      }
    } catch (error) {
      console.error("Error parsing WebSocket message: ", error);
    }
  };

  public disconnect() {
    this.isManuallyClosed = true;

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }

  public sendMessage(content: string, roomId: number) {
    const message: WSMessage = {
      type: "message",
      content,
      roomId,
    };

    this.sendWhenOpen(message);
  }

  private sendWhenOpen(message: WSMessage) {
    const payload = JSON.stringify(message);

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
      return;
    }

    if (this.socket?.readyState === WebSocket.CONNECTING) {
      this.pendingMessages.push(payload);
      return;
    }
  }
}

export const webSocketClient = new WebSocketClient();
