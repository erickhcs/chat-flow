import type WebSocket from "ws";

class ConnectionsManager {
  private clients: Map<number, WebSocket>;

  constructor() {
    this.clients = new Map<number, WebSocket>();
  }

  addClient(id: number, ws: WebSocket) {
    this.clients.set(id, ws);
  }

  removeClient(id: number) {
    this.clients.delete(id);
  }

  getClient(id: number) {
    return this.clients.get(id);
  }
}

export default new ConnectionsManager();
