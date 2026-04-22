import { WebSocketServer } from "ws";
import "dotenv/config";
import MessageHandler from "./messageHandler";
import { AuthedWebSocket } from "./types";

const wss = new WebSocketServer({
  port: (process.env.PORT as unknown as number) || 5000,
});

wss.on("listening", () => {
  console.log("Websocket server is open and ready to accept connections!");
});

wss.on("connection", async (ws: AuthedWebSocket) => {
  ws.on("message", (message: string) => {
    MessageHandler.handleMessage(ws, message);
  });

  ws.on("error", (error) => {
    console.log("Websocket error: ", error);
  });

  ws.on("close", (code, reason) => {
    console.log("Client disconnected:", code, reason.toString());
  });
});

wss.on("close", (code: number, reason: Buffer) => {
  console.log("Websocket server closed: ", code, reason.toString());
});
