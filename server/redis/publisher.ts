import Redis from "ioredis";
import "dotenv/config";

export const pub = new Redis(process.env.REDIS_URL!);

pub.on("connect", () => {
  console.log("Redis pub connected");
});

pub.on("error", (err) => {
  console.error("Redis pub error", err);
});
