import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
    return;
  }

  try {
    const decoded = jwt.verify(
      header.split(" ")[1],
      process.env.JWT_SECRET || "supersecretkey",
    ) as { id: string; email: string };

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, invalid token" });
  }
};
