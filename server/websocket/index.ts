import { WebSocketServer } from "ws";
import { loadEnvFile } from "node:process";
import MessageHandler from "./messageHandler";
import ConnectionsManager from "./connectionsManager";

loadEnvFile(".env");

const wss = new WebSocketServer({
  port: (process.env.WS_PORT as unknown as number) || 5000,
});

wss.on("listening", () => {
  console.log("Websocket server is open and ready to accept connections!");
});

wss.on("connection", async (ws) => {
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
