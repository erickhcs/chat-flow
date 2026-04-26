import express from "express";
import { prisma } from "../../database/prisma";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;

  const room = await prisma.room.create({
    data: { name, users: { create: { userId: req.userId! } } },
  });

  res.json(room);
});

router.post("/:roomId/join", authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  const parsedRoomId = Number(roomId);

  if (!req.userId) {
    return res.sendStatus(401);
  }

  if (Number.isNaN(parsedRoomId)) {
    return res.status(400).json({ error: "Invalid room ID" });
  }

  const room = await prisma.room.update({
    where: { id: parsedRoomId },
    data: {
      users: {
        connectOrCreate: {
          where: {
            roomId_userId: {
              roomId: parsedRoomId,
              userId: req.userId,
            },
          },
          create: {
            userId: req.userId,
          },
        },
      },
    },
  });

  res.json(room);
});

router.get("/", authMiddleware, async (req, res) => {
  const rooms = await prisma.room.findMany({
    where: {
      users: {
        some: {
          userId: req.userId,
        },
      },
    },
  });

  res.json(rooms);
});

export default router;
