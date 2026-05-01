import { prisma } from "../database/prisma";
import { pub } from "../redis/publisher";

type Message = {
  content: string;
  userId: number;
  roomId: number;
};

class MessageService {
  static async createMessage({ content, userId, roomId }: Message) {
    if (!content || isNaN(userId) || isNaN(roomId)) {
      throw new Error("Missing required fields to create a message.");
    }

    const message = await prisma.message.create({
      data: {
        content,
        room: { connect: { id: roomId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.room.update({
      where: { id: roomId },
      data: { lastMessageAt: new Date() },
    });

    await pub.publish(
      "chat_messages",
      JSON.stringify({
        type: "message_created",
        roomId,
        message,
      }),
    );

    return message;
  }
}

export default MessageService;
