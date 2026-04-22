import { AuthedWebSocket } from "./types";

class ConnectionsManager {
  private clients: Map<number, AuthedWebSocket>;

  constructor() {
    this.clients = new Map<number, AuthedWebSocket>();
  }

  addClient(ws: AuthedWebSocket) {
    const id = ws.user?.id || 0;
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
