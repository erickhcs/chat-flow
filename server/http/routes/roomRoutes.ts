import express from "express";
import { prisma } from "../../database/prisma";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name } = req.body;

  const room = await prisma.room.create({
    data: { name },
  });

  res.json(room);
});

router.get("/", async (req, res) => {
  const rooms = await prisma.room.findMany();

  res.json(rooms);
});

export default router;
