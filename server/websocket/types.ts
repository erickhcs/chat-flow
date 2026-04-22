import WebSocket from "ws";

export interface AuthedWebSocket extends WebSocket {
  user: {
    id: number;
  };
  isAuthenticated: boolean;
}
