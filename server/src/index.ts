import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import connectDB from "./config/db";
import cors from "cors";
import http from "http";

import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import { initSocket } from "./socket";
import { getJwtSecret } from "./config/jwt";
import { apiLimiter, authLimiter } from "./middleware/rateLimit";

dotenv.config();
getJwtSecret(); // stop right away if the secret is missing

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const PORT = process.env.PORT || 8000;

const app: Application = express();
const server = http.createServer(app);

initSocket(server, CLIENT_URL);

// behind a hosting proxy (Render, Railway), so rate limits see the real IP
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "100kb" }));

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.method} ${req.originalUrl}`,
  });
});

// last: turns thrown errors into clean JSON
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.parse.failed") {
    res.status(400).json({ success: false, message: "Invalid JSON body" });
    return;
  }
  if (err.type === "entity.too.large") {
    res.status(413).json({ success: false, message: "Request body too large" });
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Server error" });
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
