import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8000;

connectDB();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
