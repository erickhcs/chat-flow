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
          imageUrl: true,
        },
      },
    },
  });

  res.json(messages);
});

export default router;
