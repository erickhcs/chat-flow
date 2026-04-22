import express from "express";
import userRoutes from "./http/routes/userRoutes";
import roomRoutes from "./http/routes/roomRoutes";
import messageRoutes from "./http/routes/messageRoutes";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import MessageHandler from "./websocket/messageHandler";
import { AuthedWebSocket } from "./websocket/types";
import "dotenv/config";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/messages", messageRoutes);

server.listen(process.env.PORT || 5000, () => {
  console.log(`HTTP server running on port ${process.env.PORT}`);
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
