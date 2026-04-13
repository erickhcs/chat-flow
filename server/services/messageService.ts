import { prisma } from "../database/prisma";

type Message = {
  content: string;
  userId: number;
  roomId: number;
};

class MessageService {
  static createMessage({ content, userId, roomId }: Message) {
    if (!content || isNaN(userId) || isNaN(roomId)) {
      throw new Error("Missing required fields to create a message.");
    }

    const message = prisma.message.create({
      data: {
        content,
        room: { connect: { id: roomId } },
        user: { connect: { id: userId } },
      },
    });

    return message;
  }
}

export default MessageService;
