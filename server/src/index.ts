import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import http from "http";

import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import { initSocket } from "./socket";

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const PORT = process.env.PORT || 8000;

const app: Application = express();
const server = http.createServer(app);

initSocket(server, CLIENT_URL);

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Hello from TS + Express AMBAG API");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot Find ${req.method} ${req.originalUrl}`,
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
    console.log(
      `📋 Port loaded from: ${process.env.PORT ? ".env file" : "default (8000)"}`,
    );
    console.log(`🔍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
});
