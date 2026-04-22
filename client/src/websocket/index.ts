import type { Message } from "@/types";
import type { WSMessage } from "../../../types";

type MessageHandler = (message: Message) => void;

class WebSocketClient {
  private static instance: WebSocketClient | null = null;
  private socket: WebSocket;
  private pendingMessages: string[] = [];
  private token: string;

  private constructor(
    token: string,
    onReceiveMessage: MessageHandler,
    url: string = import.meta.env.VITE_WS_URL,
  ) {
    this.socket = new WebSocket(url);
    this.token = token;
    this.socket.addEventListener("message", (event) =>
      this.handleMessage(event, onReceiveMessage),
    );
    this.socket.addEventListener("open", this.handleOpen);
    this.socket.addEventListener("close", this.handleClose);
  }

  public static getInstance(
    onReceiveMessage: MessageHandler,
    token: string,
    url?: string,
  ) {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient(
        token,
        onReceiveMessage,
        url,
      );
    }

    return WebSocketClient.instance;
  }

  public joinRoom(roomId: number) {
    const message: WSMessage = {
      type: "join_room",
      roomId,
    };

    this.sendWhenOpen(message);
  }

  private handleOpen = () => {
    const authMessage: WSMessage = {
      type: "auth",
      token: this.token,
    };

    this.sendWhenOpen(authMessage);

    if (this.pendingMessages.length === 0) {
      return;
    }

    for (const pendingMessage of this.pendingMessages) {
      this.socket.send(pendingMessage);
    }

    this.pendingMessages = [];
  };

  private handleClose = (event: CloseEvent) => {
    console.log("Websocket connection closed: ", event.code, event.reason);
    WebSocketClient.instance = null;
  };

  private handleMessage = (
    event: MessageEvent,
    onReceiveMessage: (message: Message) => void,
  ) => {
    try {
      const message: WSMessage = JSON.parse(event.data);

      switch (message.type) {
        case "message":
          console.log("Received message: ", message.content);
          onReceiveMessage(message.content as Message);
          break;
      }
    } catch (error) {
      console.error("Error parsing WebSocket message: ", error);
    }
  };

  public disconnect() {
    if (this.socket.readyState === WebSocket.CLOSED) {
      return;
    }

    this.socket.close();
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

    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
      return;
    }

    if (this.socket.readyState === WebSocket.CONNECTING) {
      this.pendingMessages.push(payload);
      return;
    }
  }
}

export default WebSocketClient;
