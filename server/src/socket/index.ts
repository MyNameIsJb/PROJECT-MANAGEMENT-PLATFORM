import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Project } from "../models/Project";
import { getJwtSecret } from "../config/jwt";

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer, clientUrl: string) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Not authorized, no token"));

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || getJwtSecret(),
      ) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error("Not authorized, invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.userId}`);
    socket.join(`user:${socket.data.userId}`);

    socket.on(
      "join_board",
      async (projectId: string, ack?: (r: { ok: boolean }) => void) => {
        if (!mongoose.isValidObjectId(projectId)) return ack?.({ ok: false });

        const isMember = await Project.exists({
          _id: projectId,
          members: socket.data.userId,
        });
        if (!isMember) return ack?.({ ok: false });

        socket.join(`board:${projectId}`);
        ack?.({ ok: true });
      },
    );

    socket.on("leave_board", (projectId: string) => {
      socket.leave(`board:${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });

    return io;
  });
};

export const emitToBoard = (
  projectId: string,
  event: string,
  payload: unknown,
) => {
  io?.to(`board:${projectId}`).emit(event, payload);
};

export const emitToUsers = (
  userIds: string[],
  event: string,
  payload: unknown,
) => {
  if (!io || userIds.length === 0) return;
  io.to(userIds.map((id) => `user:${id}`)).emit(event, payload);
};

export const closeBoard = (projectId: string) => {
  io?.in(`board:${projectId}`).socketsLeave(`board:${projectId}`);
};

export const kickFromBoard = async (projectId: string, userId: string) => {
  if (!io) return;
  const sockets = await io.in(`board:${projectId}`).fetchSockets();
  sockets
    .filter((s) => s.data.userId === userId)
    .forEach((s) => s.leave(`board:${projectId}`));
};
