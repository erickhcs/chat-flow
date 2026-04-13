class RoomsManager {
  private rooms: Map<number, Set<number>>;

  constructor() {
    this.rooms = new Map<number, Set<number>>();
  }

  joinRoom(roomId: number, userId: number) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set<number>());
    }

    this.rooms.get(roomId)!.add(userId);
  }

  leaveRoom(roomId: number, userId: number) {
    if (!this.rooms.has(roomId)) {
      return;
    }

    this.rooms.get(roomId)!.delete(userId);
  }

  getUsersInRoom(roomId: number) {
    return this.rooms.get(roomId) || new Set<number>();
  }
}

export default new RoomsManager();
