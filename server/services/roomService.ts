import { prisma } from "../database/prisma";

class RoomService {
  async getRooms(userId: number) {
    const rooms = await prisma.room.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
            role: true,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    const normalizedRooms = rooms.map((room) => {
      const otherUser = room.users.find(
        (roomUser) => roomUser.user.id !== userId,
      )?.user;

      return {
        ...room,
        users: room.users.map((roomUser) => ({
          ...roomUser.user,
          role: roomUser.role,
        })),
        imageUrl: room.type === "PRIVATE" ? otherUser?.imageUrl : room.imageUrl,
        name: room.type === "PRIVATE" ? otherUser?.name : room.name,
      };
    });

    return normalizedRooms;
  }
}

export default RoomService;
