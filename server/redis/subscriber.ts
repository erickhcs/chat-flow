import Redis from "ioredis";
import "dotenv/config";

export const sub = new Redis(process.env.REDIS_URL!);

sub.on("connect", () => {
  console.log("Redis sub connected");
});

sub.on("error", (err) => {
  console.error("Redis sub error", err);
});
