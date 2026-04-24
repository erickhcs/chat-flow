import express from "express";
import { prisma } from "../../database/prisma.js";
import MessageService from "../../services/messageService.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:roomId", authMiddleware, async (req, res) => {
  const roomId = Number(req.params.roomId);

  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json(messages);
});

router.post("/:roomId", authMiddleware, async (req, res) => {
  const roomId = Number(req.params.roomId);
  const { content } = req.body;
  const userId = req.userId;

  if (typeof userId !== "number") {
    return res.status(401).json({ error: "Unauthorized" });
  }

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
