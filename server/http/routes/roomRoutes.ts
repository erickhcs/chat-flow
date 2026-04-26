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
              userId: req.userId as number,
            },
          },
          create: {
            userId: req.userId as number,
          },
        },
      },
    },
  });

  res.json(room);
});

router.post("/private/:targetUserId", authMiddleware, async (req, res) => {
  const { targetUserId } = req.params;
  const parsedTargetUserId = Number(targetUserId);

  const existingRoom = await prisma.room.findFirst({
    where: {
      type: "PRIVATE",
      AND: [
        {
          users: {
            some: {
              userId: req.userId as number,
            },
          },
        },
        {
          users: {
            some: {
              userId: parsedTargetUserId,
            },
          },
        },
        {
          users: {
            every: {
              userId: {
                in: [req.userId as number, parsedTargetUserId],
              },
            },
          },
        },
      ],
    },
    include: {
      users: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (existingRoom) {
    const normalizedExistingRoom = {
      ...existingRoom,
      users: existingRoom.users.map((roomUser) => roomUser.user),
      name: existingRoom.users.find(
        (roomUser) => roomUser.user.id !== req.userId,
      )?.user.name,
    };

    return res.json(normalizedExistingRoom);
  }

  const room = await prisma.room.create({
    data: {
      type: "PRIVATE",
      name: "",
      users: {
        createMany: {
          data: [
            { userId: req.userId as number },
            { userId: parsedTargetUserId },
          ],
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
            },
          },
        },
      },
    },
  });

  const normalizedRoom = {
    ...room,
    users: room.users.map((roomUser) => roomUser.user),
    name: room.users.find((roomUser) => roomUser.user.id !== req.userId)?.user
      .name,
  };

  res.json(normalizedRoom);
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
    include: {
      users: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const normalizedRooms = rooms.map((room) => ({
    ...room,
    users: room.users.map((roomUser) => roomUser.user),
    name:
      room.type === "PRIVATE"
        ? room.users.find((roomUser) => roomUser.user.id !== req.userId)?.user
            .name
        : room.name,
  }));

  res.json(normalizedRooms);
});

router.get("/search", authMiddleware, async (req, res) => {
  const searchQuery = req.query.searchQuery as string;

  if (typeof searchQuery !== "string" || searchQuery.trim() === "") {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: searchQuery,
          mode: "insensitive",
        },
        id: {
          not: req.userId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const groups = await prisma.room.findMany({
      where: {
        name: {
          contains: searchQuery,
          mode: "insensitive",
        },
        users: {
          none: {
            userId: req.userId,
          },
        },
        type: "GROUP",
      },
      select: {
        id: true,
        name: true,
      },
    });

    res.json({ users, groups });
  } catch (error) {
    console.error("Error searching rooms: ", error);
    res.status(500).json({
      error: "An error occurred while searching",
      errorDetails: (error as Error).message,
    });
  }
});

export default router;
