import jwt from "jsonwebtoken";
import "dotenv/config";
import express from "express";

interface JwtPayloadWithUserId extends jwt.JwtPayload {
  userId: number;
}

export function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const auth = req.headers.authorization;
  if (!auth) return res.sendStatus(401);

  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(
      token,
      `${process.env.JWT_SECRET}`,
    ) as JwtPayloadWithUserId;

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("Error verifying token: ", error);
    return res.sendStatus(401);
  }
}
