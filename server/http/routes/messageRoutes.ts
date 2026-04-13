import express from "express";
import { prisma } from "../../database/prisma.js";
import MessageService from "../../services/messageService.js";

const router = express.Router();

router.get("/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);

  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
  });

  res.json(messages);
});

router.post("/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const { userId, content } = req.body;
  try {
    const message = await MessageService.createMessage({
      content,
      userId,
      roomId,
    });

    res.json(message);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
