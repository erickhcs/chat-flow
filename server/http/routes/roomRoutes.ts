import express from "express";
import { prisma } from "../../database/prisma";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;

  const room = await prisma.room.create({
    data: { name },
  });

  res.json(room);
});

router.get("/", authMiddleware, async (req, res) => {
  const rooms = await prisma.room.findMany();

  res.json(rooms);
});

export default router;
