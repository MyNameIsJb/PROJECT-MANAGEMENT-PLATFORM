import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import { apiLimiter, authLimiter } from "./middleware/rateLimit";
import { parseOrigins } from "./config/origins";

export const createApp = (clientUrl: string): Application => {
  const app = express();

  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors({ origin: parseOrigins(clientUrl), credentials: true }));
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

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    if (err.type === "entity.parse.failed") {
      res.status(400).json({ success: false, message: "Invalid JSON body" });
      return;
    }
    if (err.type === "entity.too.large") {
      res
        .status(413)
        .json({ success: false, message: "Request body too large" });
      return;
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  });

  return app;
};
