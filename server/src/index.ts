import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8000;

connectDB();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from TS + Express");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot Find ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(
    `📋 Port loaded from: ${process.env.PORT ? ".env file" : "default (8000)"}`,
  );
  console.log(`🔍 Environment: ${process.env.NODE_ENV || "development"}`);
});
