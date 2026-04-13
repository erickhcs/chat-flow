import express from "express";
import userRoutes from "./routes/userRoutes";
import roomRoutes from "./routes/roomRoutes";
import messageRoutes from "./routes/messageRoutes";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/messages", messageRoutes);

app.listen(3000, () => {
  console.log("HTTP server running on port 3000");
});
