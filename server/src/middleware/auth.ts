import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";
import jwt from "jsonwebtoken";

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): any => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey",
    ) as { id: string; email: string };

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};
